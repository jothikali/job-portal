import db from '../config/db.js';

// 1. GET QUESTIONS
export const getQuestions = async (req, res) => {
    try {
        const [questions] = await db.query("SELECT id, question, option_a, option_b, option_c, option_d, correct_option FROM aptitude_questions");
        res.status(200).json(questions);
    } catch (err) {
        console.error("FETCH QUESTIONS ERROR:", err);
        res.status(500).json({ error: "Failed to load questions" });
    }
};

// 2. SUBMIT TEST - Rule: Status update panradhu
export const submitTest = async (req, res) => {
    const { applicationId, score } = req.body;
    console.log("Updating Row ID:", applicationId);

    try {
        // Fetch existing history
        const [rows] = await db.query(
            "SELECT status_history FROM applications WHERE id = ?",
            [applicationId]
        );
        let history = [];
        try {
            const raw = rows[0]?.status_history;
            history = raw ? JSON.parse(raw) : [];
        } catch (_) { history = []; }

        const now = new Date();
        const timestamp = now.toLocaleString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true
        }).replace(',', '');
        history.push({ status: 'FINISHED', timestamp });

        const sql = `
            UPDATE applications 
            SET status = 'FINISHED', aptitude_score = ?, status_history = ?
            WHERE id = ?`;

        const [result] = await db.query(sql, [score, JSON.stringify(history), applicationId]);
        console.log("Rows affected:", result.affectedRows);
        res.status(200).json({ status: "Success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. GET ADMIN RESULTS - Link: applications.user_id = login.id
export const getAdminResults = async (req, res) => {
    const sql = `
        SELECT 
            a.id, 
            u.name, 
            u.email, 
            a.aptitude_score, 
            a.status
        FROM applications a
        JOIN login u ON a.user_id = u.id 
        WHERE a.status = 'FINISHED'`;

    try {
        const [rows] = await db.query(sql);
        res.status(200).json(rows);
    } catch (err) {
        console.error("ADMIN FETCH ERROR:", err);
        res.status(500).json({ error: "Query failed due to column mismatch" });
    }
};