// 1. Change require to import and add .js extension
import db from '../config/db.js';

// 2. Add 'export' before each function
export const getReviews = async (req, res) => {
    try {
        // Database-la irukura columns: id, company_name, rating, review_text, location, job_title, created_at
        const [rows] = await db.query("SELECT * FROM company_reviews ORDER BY created_at DESC");
        res.status(200).json(rows);
    } catch (err) {
        console.error("MYSQL ERROR:", err.message);
        res.status(500).json({ error: "Database error: " + err.message });
    }
};

// 3. Add 'export' before this function too
export const addReview = async (req, res) => {
    const { company_name, rating, review_text, location, job_title } = req.body;
    try {
        const sql = "INSERT INTO company_reviews (company_name, rating, review_text, location, job_title) VALUES (?, ?, ?, ?, ?)";
        await db.query(sql, [company_name, rating, review_text, location, job_title]);
        res.status(201).json({ message: "Review added successfully!" });
    } catch (err) {
        console.error("MYSQL INSERT ERROR:", err.message);
        res.status(500).json({ error: "Database error" });
    }
};
