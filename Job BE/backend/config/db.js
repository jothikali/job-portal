// 1. Change require to import
import mysql from 'mysql2/promise'; 
import dotenv from 'dotenv';

dotenv.config();

// VARIABLE NAME: 'db' nu maathitta logic correct-ah irukkum
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
    // SSL required for cloud DBs (Aiven, PlanetScale, Railway)
    // Set DB_SSL=true in your Render environment variables
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

// Test connection logic
const checkConnection = async () => {
    try {
        const connection = await db.getConnection(); // ingayum 'db' use pannunga
        console.log("Connected to MySQL Database via Pool ✅");
        connection.release();
    } catch (err) {
        console.error("Database connection failed:", err.message);
    }
};

checkConnection();

// 2. Ippo 'db' ah export pannunga - Idhu dhaan correct!
export default db;