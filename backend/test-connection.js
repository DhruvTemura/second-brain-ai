require('dotenv').config();
const { Pool } = require('pg');

console.log('🔍 Testing database connection...\n');

// Show connection string (hide password)
const connString = process.env.DATABASE_URL;
if (connString) {
  console.log('Connection string:', connString.replace(/:[^:@]+@/, ':****@'));
} else {
  console.log('❌ DATABASE_URL not found in .env file!');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.query('SELECT NOW() as time, current_database() as db, version() as version', (err, res) => {
  if (err) {
    console.error('\n❌ Connection FAILED!');
    console.error('Error:', err.message);
    console.error('\nFull error details:', err);
  } else {
    console.log('\n✅ Connection SUCCESSFUL!');
    console.log('Database:', res.rows[0].db);
    console.log('Time:', res.rows[0].time);
    console.log('PostgreSQL version:', res.rows[0].version.split(' ')[0], res.rows[0].version.split(' ')[1]);
  }
  pool.end();
  process.exit(err ? 1 : 0);
});