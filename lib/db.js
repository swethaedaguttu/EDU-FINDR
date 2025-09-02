import mysql from 'mysql2/promise';

let pool;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
      database: process.env.DB_NAME || 'schools_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: 'utf8mb4',
      // Disable SSL for local development
      ssl: false,
      // Use recommended authPlugins API only (no deprecated authSwitchHandler)
      authPlugins: {
        mysql_native_password: () => () => Buffer.alloc(0)
      }
    });
  }
  return pool;
}

// Test database connection
export async function testConnection() {
  try {
    const pool = getPool();
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully!');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}
