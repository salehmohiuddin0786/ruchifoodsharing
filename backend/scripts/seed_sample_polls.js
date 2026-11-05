const db = require('../config/db');

async function seed() {
  console.log('Seeding sample dish polls...');

  // Find a registered cook
  const [cooks] = await db.query(`
    SELECT u.id, u.name 
    FROM users u 
    JOIN user_roles ur ON u.id = ur.user_id 
    JOIN roles r ON ur.role_id = r.id 
    WHERE r.name IN ('COOK', 'COOK_DONOR')
    LIMIT 1
  `);

  if (cooks.length === 0) {
    console.log('No cook found to seed polls.');
    process.exit(0);
  }

  const cook = cooks[0];

  // 1. ACTIVE POLL: "Vote for Tomorrow's Special Homestyle Lunch"
  const activePollId = 'poll_seed_active_1';
  await db.query(`DELETE FROM dish_polls WHERE id IN ('poll_seed_active_1', 'poll_seed_closed_1')`);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const endsAt = new Date();
  endsAt.setHours(endsAt.getHours() + 6); // Ends in 6 hours

  await db.query(`
    INSERT INTO dish_polls 
      (id, cook_id, title, description, cooking_date, voting_starts_at, voting_ends_at, status, total_votes)
    VALUES (?, ?, ?, ?, ?, NOW(), ?, 'ACTIVE', 18)
  `, [
    activePollId,
    cook.id,
    "Vote for Tomorrow's Special Homestyle Lunch!",
    "Help me choose our community meal feature for tomorrow! The winning dish will be slow-cooked with fresh local ingredients and made available for advance pre-order.",
    tomorrowStr,
    endsAt,
  ]);

  // Options for active poll
  const activeOptions = [
    {
      id: 'opt_seed_1',
      dish_name: 'Hyderabadi Chicken Dum Biryani',
      description: 'Slow-dum aromatic long-grain basmati rice with marinated chicken, fried onions, and whole spices.',
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
      food_type: 'NON_VEG',
      estimated_price: 189.00,
      vote_count: 9,
    },
    {
      id: 'opt_seed_2',
      dish_name: 'Paneer Makhani with Butter Naan',
      description: 'Fresh cottage cheese cubes simmered in a creamy, velvety cashew-tomato gravy served with soft naans.',
      image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80',
      food_type: 'VEG',
      estimated_price: 169.00,
      vote_count: 6,
    },
    {
      id: 'opt_seed_3',
      dish_name: 'Traditional Andhra Gongura Pappu Meal',
      description: 'Authentic tangy sorrel leaves cooked with toor dal, tempered with garlic, mustard seeds, and ghee.',
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
      food_type: 'VEG',
      estimated_price: 139.00,
      vote_count: 3,
    },
  ];

  for (const opt of activeOptions) {
    await db.query(`
      INSERT INTO dish_poll_options 
        (id, poll_id, dish_name, description, image, food_type, estimated_price, vote_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      opt.id,
      activePollId,
      opt.dish_name,
      opt.description,
      opt.image,
      opt.food_type,
      opt.estimated_price,
      opt.vote_count,
    ]);
  }

  // 2. CLOSED POLL WITH WINNER: "Weekend Feast Community Vote"
  const closedPollId = 'poll_seed_closed_1';
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  await db.query(`
    INSERT INTO dish_polls 
      (id, cook_id, title, description, cooking_date, voting_starts_at, voting_ends_at, status, winner_option_id, total_votes)
    VALUES (?, ?, ?, ?, ?, NOW(), NOW(), 'CLOSED', 'opt_seed_4', 35)
  `, [
    closedPollId,
    cook.id,
    "Weekend Feast Community Vote",
    "Community voted for our weekend highlight dish. Winner is now announced!",
    tomorrowStr,
  ]);

  const closedOptions = [
    {
      id: 'opt_seed_4',
      dish_name: 'Chettinad Pepper Chicken with Parotta',
      description: 'Fiery south Indian black pepper chicken curry with flaky layered parottas.',
      image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&auto=format&fit=crop&q=80',
      food_type: 'NON_VEG',
      estimated_price: 199.00,
      vote_count: 22,
    },
    {
      id: 'opt_seed_5',
      dish_name: 'Dal Makhani & Jeera Rice Platter',
      description: 'Overnight slow-cooked black lentils with rich cream and cumin-scented basmati rice.',
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
      food_type: 'VEG',
      estimated_price: 159.00,
      vote_count: 13,
    },
  ];

  for (const opt of closedOptions) {
    await db.query(`
      INSERT INTO dish_poll_options 
        (id, poll_id, dish_name, description, image, food_type, estimated_price, vote_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      opt.id,
      closedPollId,
      opt.dish_name,
      opt.description,
      opt.image,
      opt.food_type,
      opt.estimated_price,
      opt.vote_count,
    ]);
  }

  await db.query(`
    INSERT INTO dish_poll_results 
      (id, poll_id, winning_option_id, total_votes, result_type, finalized_at)
    VALUES ('res_seed_1', ?, 'opt_seed_4', 35, 'CLEAR_WINNER', NOW())
  `, [closedPollId]);

  console.log('✅ Sample active & closed dish polls seeded successfully!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
