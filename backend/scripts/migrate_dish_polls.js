const db = require('../config/db');

async function migrate() {
  console.log('Starting dish polling migration...');

  await db.query(`
    CREATE TABLE IF NOT EXISTS dish_polls (
      id VARCHAR(64) PRIMARY KEY,
      cook_id VARCHAR(64) NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT NULL,
      cooking_date DATE NOT NULL,
      voting_starts_at DATETIME NOT NULL,
      voting_ends_at DATETIME NOT NULL,
      status ENUM('DRAFT', 'ACTIVE', 'CLOSED', 'TIED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
      winner_option_id VARCHAR(64) NULL,
      total_votes INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_cook (cook_id),
      INDEX idx_status (status),
      INDEX idx_voting_ends (voting_ends_at),
      CONSTRAINT fk_dish_poll_cook FOREIGN KEY (cook_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS dish_poll_options (
      id VARCHAR(64) PRIMARY KEY,
      poll_id VARCHAR(64) NOT NULL,
      dish_name VARCHAR(255) NOT NULL,
      description TEXT NULL,
      image VARCHAR(500) NULL,
      food_type ENUM('VEG', 'NON_VEG') NOT NULL DEFAULT 'VEG',
      estimated_price DECIMAL(10,2) NULL,
      vote_count INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_poll (poll_id),
      CONSTRAINT fk_poll_option_poll FOREIGN KEY (poll_id) REFERENCES dish_polls(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS dish_poll_votes (
      id VARCHAR(64) PRIMARY KEY,
      poll_id VARCHAR(64) NOT NULL,
      option_id VARCHAR(64) NOT NULL,
      customer_id VARCHAR(64) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_poll_customer (poll_id, customer_id),
      INDEX idx_vote_option (option_id),
      INDEX idx_vote_customer (customer_id),
      CONSTRAINT fk_poll_vote_poll FOREIGN KEY (poll_id) REFERENCES dish_polls(id) ON DELETE CASCADE,
      CONSTRAINT fk_poll_vote_option FOREIGN KEY (option_id) REFERENCES dish_poll_options(id) ON DELETE CASCADE,
      CONSTRAINT fk_poll_vote_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS dish_poll_results (
      id VARCHAR(64) PRIMARY KEY,
      poll_id VARCHAR(64) NOT NULL,
      winning_option_id VARCHAR(64) NULL,
      total_votes INT NOT NULL DEFAULT 0,
      result_type ENUM('CLEAR_WINNER', 'TIE_BREAK_MANUAL', 'NO_VOTES') NOT NULL DEFAULT 'CLEAR_WINNER',
      tie_break_reason TEXT NULL,
      finalized_at DATETIME NOT NULL,
      INDEX idx_result_poll (poll_id),
      CONSTRAINT fk_poll_result_poll FOREIGN KEY (poll_id) REFERENCES dish_polls(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS dish_poll_audit_logs (
      id VARCHAR(64) PRIMARY KEY,
      poll_id VARCHAR(64) NOT NULL,
      actor_id VARCHAR(64) NOT NULL,
      action VARCHAR(100) NOT NULL,
      old_value JSON NULL,
      new_value JSON NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_audit_poll (poll_id),
      INDEX idx_audit_actor (actor_id),
      CONSTRAINT fk_poll_audit_poll FOREIGN KEY (poll_id) REFERENCES dish_polls(id) ON DELETE CASCADE,
      CONSTRAINT fk_poll_audit_actor FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  console.log('✅ Dish polling tables successfully migrated!');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
