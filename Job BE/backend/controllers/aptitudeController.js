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
    const { applicationId, score, answers } = req.body;
    console.log("Updating Row ID:", applicationId); // Check if this is 1 or 3
    
    const sql = "UPDATE applications SET status = 'FINISHED', aptitude_score = ? WHERE id = ?";
    
    try {
        const [result] = await db.query(sql, [score, applicationId]);
        console.log("Rows affected:", result.affectedRows); // Idhu 0-nu vandha ID thappu!
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