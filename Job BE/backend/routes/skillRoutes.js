import express from 'express';
const router = express.Router();
import db from '../config/db.js';

// 1. EXPERIENCE SUGGESTIONS (Job Titles from master_job_titles)
router.get('/experience-suggestions', async (req, res) => {
    const searchTerm = req.query.q;
    
    if (!searchTerm) {
        return res.json([]);
    }

    try {
        // Table: master_job_titles | Column: title_name
        // %${searchTerm}% nu kudutha dhaan type pandra word enga irundhalum fetch aagum
        const sql = "SELECT title_name FROM master_job_titles WHERE title_name LIKE ? LIMIT 40";
        const [rows] = await db.query(sql, [`%${searchTerm}%`]);
        
        // Rows-ah flat array-va maathi anupuvom
        const jobArray = rows.map(row => row.title_name);
        
        console.log(`Experience Search [${searchTerm}]: Found ${jobArray.length} results`);
        res.json(jobArray);
    } catch (err) {
        console.error("Experience Suggestions Error:", err);
        res.status(500).json({ error: "Database error fetching job titles" });
    }
});

router.get('/company-suggestions', async (req, res) => {
    const searchTerm = req.query.q;
    
    if (!searchTerm) {
        return res.json([]);
    }

    try {
        // SQL query with master_companies
        const sql = `
            SELECT company_name 
            FROM master_companies 
            WHERE company_name LIKE ? 
            ORDER BY company_name ASC 
            LIMIT 10
        `;
        
        // IMPORTANT: Promise-based query (async/await)
        const [rows] = await db.query(sql, [`${searchTerm}%`]);
        
        const suggestions = rows.map(row => row.company_name);
        
        console.log(`Company Search [${searchTerm}]: Found ${suggestions.length} results`);
        res.json(suggestions);
    } catch (err) {
        console.error("Company Suggestions Error:", err);
        // Res status 500 kudutha frontend-la catch aagum, crash aagathu
        res.status(500).json({ error: "Database error fetching companies" });
    }
});
// 2. SKILL SUGGESTIONS (From skills table)
router.get('/suggestions', async (req, res) => {
    const searchTerm = req.query.q;
    
    if (!searchTerm) {
        return res.json([]);
    }

    try {
        const sql = "SELECT skill_name FROM skills WHERE skill_name LIKE ? LIMIT 10";
        const [rows] = await db.query(sql, [`${searchTerm}%`]);
        const skillArray = rows.map(row => row.skill_name);
        res.json(skillArray);
    } catch (err) {
        console.error("Skills Suggestions Error:", err);
        res.status(500).json({ error: "Database error fetching skills" });
    }
});

// 3. GET ALL SKILLS (Basic fetch)
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT skill_name FROM skills ORDER BY skill_name ASC");
        const skillArray = rows.map(row => row.skill_name);
        res.json(skillArray);
    } catch (err) {
        console.error("Skills Fetch Error:", err);
        res.status(500).json({ error: "Database error" });
    }
});

// 4. SAVE SKILL (Optional - if you need to save to DB)
router.post('/save', async (req, res) => {
    const { skill_name } = req.body;
    try {
        const sql = "INSERT INTO skills (skill_name) VALUES (?) ON DUPLICATE KEY UPDATE skill_name = skill_name";
        await db.query(sql, [skill_name]);
        res.json({ message: "Skill saved successfully" });
    } catch (err) {
        console.error("Save Skill Error:", err);
        res.status(500).json({ error: "Failed to save skill" });
    }
});

export default router;