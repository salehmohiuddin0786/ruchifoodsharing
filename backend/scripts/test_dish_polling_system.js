const db = require('../config/db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'ruchi_secure_jwt_secret_hyderabad_2026';

function generateToken(id) {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '1d' });
}

async function runTests() {
  console.log('🧪 Starting Comprehensive Dish Polling System Tests...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Get test users
  const [cooks] = await db.query(`
    SELECT u.id, u.name FROM users u 
    JOIN user_roles ur ON u.id = ur.user_id 
    JOIN roles r ON ur.role_id = r.id 
    WHERE r.name IN ('COOK', 'COOK_DONOR') LIMIT 1
  `);
  const cook = cooks[0];

  const [customers] = await db.query(`
    SELECT u.id, u.name FROM users u 
    JOIN user_roles ur ON u.id = ur.user_id 
    JOIN roles r ON ur.role_id = r.id 
    WHERE r.name = 'CUSTOMER' LIMIT 2
  `);
  const customer1 = customers[0];
  const customer2 = customers[1] || customers[0];

  console.log(`Test Cook: ${cook.name} (${cook.id})`);
  console.log(`Test Customer 1: ${customer1.name} (${customer1.id})`);
  console.log(`Test Customer 2: ${customer2.name} (${customer2.id})\n`);

  const API_BASE = 'http://localhost:5001/api/polls';

  // Helper fetch
  async function api(path, method = 'GET', body = null, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
  }

  const cookToken = generateToken(cook.id);
  const cust1Token = generateToken(customer1.id);

  // TEST 1: Cook creates a poll with 3 options
  console.log('--- Test 1: Cook Creates Dish Poll (2 to 5 options) ---');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const deadline = new Date();
  deadline.setHours(deadline.getHours() + 2); // ends in 2 hours

  const createRes = await api('/cook', 'POST', {
    title: 'Automated Test Dish Poll',
    description: 'Testing polling validation rules',
    cookingDate: tomorrow.toISOString().split('T')[0],
    votingStartsAt: new Date().toISOString(),
    votingEndsAt: deadline.toISOString(),
    status: 'ACTIVE',
    options: [
      {
        dishName: 'Option A: Dum Biryani',
        description: 'Flavorful spiced rice',
        foodType: 'NON_VEG',
        estimatedPrice: 190,
      },
      {
        dishName: 'Option B: Paneer Butter Masala',
        description: 'Rich cottage cheese curry',
        foodType: 'VEG',
        estimatedPrice: 170,
      },
    ],
  }, cookToken);

  assert(createRes.status === 201 && createRes.data.pollId, 'Cook created active poll with 2 options');
  const pollId = createRes.data.pollId;

  // TEST 2: Rule 7: Cook cannot vote in their own poll
  console.log('\n--- Test 2: Cook Cannot Vote in Their Own Poll ---');
  const [optRows] = await db.query('SELECT id, dish_name FROM dish_poll_options WHERE poll_id = ?', [pollId]);
  const optA = optRows[0];
  const optB = optRows[1];

  const cookVoteRes = await api(`/${pollId}/vote`, 'POST', { optionId: optA.id }, cookToken);
  assert(cookVoteRes.status === 403, 'Cook is blocked from voting in their own poll (Rule 7)');

  // TEST 3: Customer 1 votes for Option A
  console.log('\n--- Test 3: Customer Casts Vote ---');
  const voteRes = await api(`/${pollId}/vote`, 'POST', { optionId: optA.id }, cust1Token);
  assert(voteRes.status === 200 && voteRes.data.userVotedOptionId === optA.id, 'Customer 1 voted for Option A');

  // Verify DB record & unique constraint
  const [voteInDb] = await db.query('SELECT * FROM dish_poll_votes WHERE poll_id = ? AND customer_id = ?', [pollId, customer1.id]);
  assert(voteInDb.length === 1 && voteInDb[0].option_id === optA.id, 'Vote accurately stored in dish_poll_votes table');

  // TEST 4: Customer 1 changes vote from Option A to Option B
  console.log('\n--- Test 4: Customer Changes Vote Before Deadline ---');
  const changeRes = await api(`/${pollId}/vote`, 'POST', { optionId: optB.id }, cust1Token);
  assert(changeRes.status === 200 && changeRes.data.userVotedOptionId === optB.id, 'Customer 1 changed vote to Option B (Rule 2)');

  const [optACheck] = await db.query('SELECT vote_count FROM dish_poll_options WHERE id = ?', [optA.id]);
  const [optBCheck] = await db.query('SELECT vote_count FROM dish_poll_options WHERE id = ?', [optB.id]);
  assert(optACheck[0].vote_count === 0 && optBCheck[0].vote_count === 1, 'Vote count decremented on old option and incremented on new option');

  // TEST 5: Verify Audit Log recorded
  console.log('\n--- Test 5: Verify Audit Log Recorded ---');
  const [auditLogs] = await db.query('SELECT action FROM dish_poll_audit_logs WHERE poll_id = ? ORDER BY created_at DESC', [pollId]);
  assert(auditLogs.some(l => l.action === 'VOTE_CHANGED'), 'VOTE_CHANGED recorded in dish_poll_audit_logs');

  // TEST 6: Voting after deadline is strictly rejected
  console.log('\n--- Test 6: Voting After Deadline Rejected ---');
  // Temporarily set voting_ends_at to the past
  await db.query('UPDATE dish_polls SET voting_ends_at = DATE_SUB(NOW(), INTERVAL 1 HOUR) WHERE id = ?', [pollId]);
  const expiredVoteRes = await api(`/${pollId}/vote`, 'POST', { optionId: optA.id }, cust1Token);
  assert(expiredVoteRes.status === 400, 'Voting after deadline is blocked (Rule 4)');

  // TEST 7: Automatic Poll Closure Worker
  console.log('\n--- Test 7: Automatic Poll Closure Worker ---');
  const { closeExpiredPolls } = require('../cron/pollWorker');
  await closeExpiredPolls();

  const [closedPoll] = await db.query('SELECT status, winner_option_id, total_votes FROM dish_polls WHERE id = ?', [pollId]);
  assert(closedPoll[0].status === 'CLOSED', 'Expired poll automatically closed by background worker');
  assert(closedPoll[0].winner_option_id === optB.id, 'Winning option Option B identified from actual DB votes');

  // TEST 8: Tie-Breaking Scenario
  console.log('\n--- Test 8: Tie-Breaking Detection & Cook Manual Resolution ---');
  const tiedPollId = `poll_tie_test_${Date.now()}`;
  await db.query(`
    INSERT INTO dish_polls (id, cook_id, title, cooking_date, voting_starts_at, voting_ends_at, status, total_votes)
    VALUES (?, ?, 'Tied Poll Test', CURDATE(), NOW(), DATE_SUB(NOW(), INTERVAL 5 MINUTE), 'ACTIVE', 2)
  `, [tiedPollId, cook.id]);

  const optTie1 = `opt_t1_${Date.now()}`;
  const optTie2 = `opt_t2_${Date.now()}`;
  await db.query(`
    INSERT INTO dish_poll_options (id, poll_id, dish_name, vote_count) VALUES
    (?, ?, 'Tied Dish 1', 1),
    (?, ?, 'Tied Dish 2', 1)
  `, [optTie1, tiedPollId, optTie2, tiedPollId]);

  // Run worker to detect tie
  await closeExpiredPolls();

  const [tiedPollCheck] = await db.query('SELECT status FROM dish_polls WHERE id = ?', [tiedPollId]);
  assert(tiedPollCheck[0].status === 'TIED', 'Background worker correctly flagged tied vote as TIED (Rule 6)');

  // Cook breaks tie manually
  const tieBreakRes = await api(`/cook/${tiedPollId}/tie-break`, 'POST', {
    winningOptionId: optTie1,
    tieBreakReason: 'Better organic spices sourced for Tied Dish 1.',
  }, cookToken);

  assert(tieBreakRes.status === 200, 'Cook resolved tie manually with reason');
  const [resolvedPoll] = await db.query('SELECT status, winner_option_id FROM dish_polls WHERE id = ?', [tiedPollId]);
  assert(resolvedPoll[0].status === 'CLOSED' && resolvedPoll[0].winner_option_id === optTie1, 'Tied poll finalized with cook choice');

  // TEST 9: Pre-Order Creation Integration (Rule 11)
  console.log('\n--- Test 9: Pre-Order Integration from Winning Dish ---');
  const cookTime = new Date();
  cookTime.setHours(cookTime.getHours() + 18);

  const preorderRes = await api(`/cook/${pollId}/create-preorder`, 'POST', {
    pricePerPlate: 175,
    totalPlates: 20,
    cookingStartsAt: cookTime.toISOString(),
    deliveryAvailable: true,
    deliveryFee: 30,
  }, cookToken);

  assert(preorderRes.status === 201 && preorderRes.data.foodPostId, 'Pre-order created from winning dish');
  const [createdPost] = await db.query('SELECT * FROM food_posts WHERE id = ?', [preorderRes.data.foodPostId]);
  assert(createdPost.length > 0 && createdPost[0].dish_name === optB.dish_name, 'Food post dish_name matches winning dish');
  assert(createdPost[0].active_customer_bookings_count === 0, 'RUCHI 4-customer limit structure ready');

  // TEST 10: Notification Delivery
  console.log('\n--- Test 10: Notification Verification ---');
  const [custNotifs] = await db.query('SELECT * FROM notifications WHERE user_id = ? AND type = "POLL" ORDER BY created_at DESC', [customer1.id]);
  assert(custNotifs.length > 0, 'Customer received in-app notifications for voting and closing');

  // Cleanup test polls
  await db.query('DELETE FROM food_posts WHERE id = ?', [preorderRes.data.foodPostId]);
  await db.query('DELETE FROM dish_polls WHERE id IN (?, ?)', [pollId, tiedPollId]);

  console.log('\n=======================================================');
  console.log(`🎉 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('=======================================================');

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
