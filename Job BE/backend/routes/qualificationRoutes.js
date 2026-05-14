import express from 'express';
import  db  from '../config/db.js'; // Unga db connection file path correct-ah kudunga

const router = express.Router();

// 1. GET: All qualifications for a user
router.get('/all/:userId', async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM user_qualifications WHERE user_id = ? ORDER BY created_at DESC", 
            [req.params.userId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. POST: Add new qualification
router.post('/add', async (req, res) => {
    const { user_id, type, main_value, sub_value, field_of_study, month_val, year_val } = req.body;
    try {
        const query = `INSERT INTO user_qualifications 
            (user_id, type, main_value, sub_value, field_of_study, month_val, year_val) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const [result] = await db.query(query, [user_id, type, main_value, sub_value, field_of_study, month_val, year_val]);
        res.json({ message: "Added successfully", id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. PUT: Update existing qualification
router.put('/update/:id', async (req, res) => {
    const { main_value, sub_value, field_of_study, month_val, year_val } = req.body;
    try {
        const query = `UPDATE user_qualifications 
            SET main_value = ?, sub_value = ?, field_of_study = ?, month_val = ?, year_val = ? 
            WHERE id = ?`;
        await db.query(query, [main_value, sub_value, field_of_study, month_val, year_val, req.params.id]);
        res.json({ message: "Updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. DELETE: Remove qualification
router.delete('/:id', async (req, res) => {
    try {
        await db.query("DELETE FROM user_qualifications WHERE id = ?", [req.params.id]);
        res.json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;