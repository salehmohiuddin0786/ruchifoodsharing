const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDatabase() {
  console.log('🔄 Connecting to XAMPP MySQL at localhost:3306...');
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      multipleStatements: true,
    });

    console.log('✅ Connected to MySQL server.');

    // Read schema SQL
    const schemaPath = path.join(__dirname, '..', '..', 'database', 'ruchi_schema.sql');
    if (fs.existsSync(schemaPath)) {
      console.log('📄 Executing database schema from database/ruchi_schema.sql...');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await connection.query(schemaSql);
      console.log('✅ ruchi_db schema created successfully.');
    } else {
      console.warn('⚠️ Schema file not found at:', schemaPath);
    }

    // Read seed SQL
    const seedPath = path.join(__dirname, '..', '..', 'database', 'seed.sql');
    if (fs.existsSync(seedPath)) {
      console.log('🌱 Seeding initial pilot data from database/seed.sql...');
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      await connection.query(seedSql);
      console.log('✅ Pilot seed data populated successfully.');
    }

    console.log('🎉 Database initialization complete!');
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

if (require.main === module) {
  initDatabase();
}

module.exports = initDatabase;
