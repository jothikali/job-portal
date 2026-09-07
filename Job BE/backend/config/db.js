import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Log the host being used so Render logs confirm the right value
console.log('[DB] Connecting to:', process.env.DB_HOST, ':', process.env.DB_PORT);
console.log('[DB] Database     :', process.env.DB_NAME);
console.log('[DB] SSL enabled  :', process.env.DB_SSL);

const db = mysql.createPool({
    host:     process.env.DB_HOST,
    port:     parseInt(process.env.DB_PORT || '3306'),
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: '+05:30',
    dateStrings: true,
    // Aiven requires SSL — rejectUnauthorized:false accepts self-signed certs
    ssl: {
        rejectUnauthorized: false
    },
});

// Test connection on startup
const checkConnection = async () => {
    try {
        const connection = await db.getConnection();
        console.log('[DB] Connected to MySQL via Pool ✅');
        connection.release();
    } catch (err) {
        console.error('[DB] Connection failed:', err.message);
        // Don't crash the server — routes will return 500 until DB is reachable
    }
};

checkConnection();

export default db;
