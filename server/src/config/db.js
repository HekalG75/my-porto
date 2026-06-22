const mysql2 = require('mysql2/promise');
require('dotenv').config();

const pool = mysql2.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'portfolio_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
});

// Test koneksi saat startup
const testConnection = async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ MySQL Database terhubung berhasil!');
    conn.release();
  } catch (err) {
    console.error('❌ Gagal terhubung ke MySQL:', err.message);
    process.exit(1);
  }
};

testConnection();

module.exports = pool;
