// 1. Change require to import and add .js extension
import db from '../config/db.js'; 

// 2. Add 'export' before each function
export const addJob = async (req, res) => {
    const { title, company, location, salary, description, type, category } = req.body;
    try {
        const sql = `INSERT INTO jobs (title, company, location, salary, description, type, category) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        await db.query(sql, [title, company, location, salary, description, type, category]);
        res.status(200).json({ status: "Success", message: "Job Posted Successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAdminStats = async (req, res) => {
    try {
        const jobsQuery = "SELECT COUNT(*) as totalJobs FROM jobs";
        const appsQuery = "SELECT COUNT(*) as totalApps FROM applications";

        const [jobsResult] = await db.query(jobsQuery);
        const [appsResult] = await db.query(appsQuery);

        res.status(200).json({
            totalJobs: jobsResult[0].totalJobs,
            applicants: appsResult[0].totalApps,
            pending: 8 
        });
    } catch (err) {
        console.error("Stats error:", err);
        res.status(500).json({ error: err.message });
    }
};

export const deleteJob = async (req, res) => {
    const { id } = req.params;
    try {
        const sql = "DELETE FROM jobs WHERE id = ?";
        await db.query(sql, [id]);
        res.status(200).json({ status: "Success", message: "Job Deleted Successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateJob = async (req, res) => {
    const { id } = req.params;
    const { title, company, location, category, type } = req.body;
    try {
        const sql = "UPDATE jobs SET title=?, company=?, location=?, category=?, type=? WHERE id=?";
        await db.query(sql, [title, company, location, category, type, id]);
        res.status(200).json({ message: "Job updated successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

