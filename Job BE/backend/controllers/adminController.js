// 1. Change require to import and add .js extension
import db from '../config/db.js';
import { sendShortlistEmail } from '../services/emailService.js';

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

export const getJobFunnelStats = async (req, res) => {
    try {
        // Single query: for every job, count applications bucketed into 4 funnel stages
        const sql = `
            SELECT
                j.id        AS jobId,
                COUNT(a.id) AS total,
                SUM(CASE WHEN UPPER(a.status) IN ('PENDING','SHORTLISTED') THEN 1 ELSE 0 END)                          AS screening,
                SUM(CASE WHEN UPPER(a.status) IN ('APTITUDE ROUND','FINISHED') THEN 1 ELSE 0 END)                     AS aptitude,
                SUM(CASE WHEN UPPER(a.status) IN ('TECHNICAL INTERVIEW','HR DISCUSSION') THEN 1 ELSE 0 END)           AS interview,
                SUM(CASE WHEN UPPER(a.status) IN ('HIRED','OFFER RELEASED') THEN 1 ELSE 0 END)                        AS hired,
                SUM(CASE WHEN UPPER(a.status) = 'REJECTED' THEN 1 ELSE 0 END)                                         AS rejected
            FROM jobs j
            LEFT JOIN applications a ON a.job_id = j.id
            GROUP BY j.id`;

        const [rows] = await db.query(sql);

        // Convert to a keyed map { jobId -> stats }
        const stats = {};
        rows.forEach(r => {
            stats[r.jobId] = {
                total:     Number(r.total),
                screening: Number(r.screening),
                aptitude:  Number(r.aptitude),
                interview: Number(r.interview),
                hired:     Number(r.hired),
                rejected:  Number(r.rejected),
            };
        });

        res.status(200).json(stats);
    } catch (err) {
        console.error("Funnel stats error:", err);
        res.status(500).json({ error: err.message });
    }
};


// ─── Shortlist Candidate + Send Email Notification ───────────────────────────
export const shortlistCandidate = async (req, res) => {
    const {
        applicationId,
        candidateEmail,
        candidateName,
        jobTitle,
        stageName,      // e.g. "Shortlisted", "Aptitude Round", "Technical Interview"
        interviewDate,  // optional
        interviewTime,  // optional
        interviewLink,  // optional
    } = req.body;

    if (!applicationId || !candidateEmail || !candidateName || !jobTitle || !stageName) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    try {
        // 1. Update application status in DB (reuse audit log pattern)
        const [rows] = await db.query(
            'SELECT status_history FROM applications WHERE id = ?',
            [applicationId]
        );
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        let history = [];
        try { history = rows[0].status_history ? JSON.parse(rows[0].status_history) : []; }
        catch { history = []; }

        const now = new Date();
        const timestamp = now.toLocaleString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true,
        }).replace(',', '');
        history.push({ status: stageName, timestamp });

        await db.query(
            `UPDATE applications
             SET status = ?, interview_date = ?, interview_time = ?, status_history = ?
             WHERE id = ?`,
            [stageName, interviewDate || null, interviewTime || null, JSON.stringify(history), applicationId]
        );

        // 2. Send email
        await sendShortlistEmail({
            candidateEmail,
            candidateName,
            jobTitle,
            stageName,
            interviewDate,
            interviewTime,
            interviewLink,
        });

        return res.status(200).json({
            success: true,
            message: `Candidate moved to ${stageName} and notified via email.`,
        });

    } catch (err) {
        console.error('[Shortlist] Error:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
};

// ─── Bulk Status Update ───────────────────────────────────────────────────────
export const bulkUpdateStatus = async (req, res) => {
    const { applicationIds, newStatus } = req.body;
    if (!Array.isArray(applicationIds) || applicationIds.length === 0 || !newStatus) {
        return res.status(400).json({ success: false, message: 'applicationIds[] and newStatus required' });
    }
    try {
        const now = new Date();
        const timestamp = now.toLocaleString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true,
        }).replace(',', '');

        // Update each application — append history entry
        for (const appId of applicationIds) {
            const [rows] = await db.query('SELECT status_history FROM applications WHERE id = ?', [appId]);
            if (rows.length === 0) continue;
            let history = [];
            try { history = rows[0].status_history ? JSON.parse(rows[0].status_history) : []; } catch { history = []; }
            history.push({ status: newStatus, timestamp });
            await db.query(
                'UPDATE applications SET status = ?, status_history = ? WHERE id = ?',
                [newStatus, JSON.stringify(history), appId]
            );
        }
        return res.status(200).json({ success: true, updated: applicationIds.length });
    } catch (err) {
        console.error('[Bulk Update] Error:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
};

// ─── Analytics — applications per job + stage breakdown + over time ───────────
export const getAnalytics = async (req, res) => {
    try {
        // Applications per job (top 10)
        const [perJob] = await db.query(`
            SELECT j.title AS job, COUNT(a.id) AS count
            FROM jobs j LEFT JOIN applications a ON a.job_id = j.id
            GROUP BY j.id ORDER BY count DESC LIMIT 10
        `);

        // Stage distribution across all applications
        const [byStage] = await db.query(`
            SELECT status AS stage, COUNT(*) AS count
            FROM applications GROUP BY status ORDER BY count DESC
        `);

        // Applications over last 30 days
        const [overTime] = await db.query(`
            SELECT DATE(applied_date) AS date, COUNT(*) AS count
            FROM applications
            WHERE applied_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            GROUP BY DATE(applied_date) ORDER BY date ASC
        `);

        return res.status(200).json({ perJob, byStage, overTime });
    } catch (err) {
        console.error('[Analytics] Error:', err);
        return res.status(500).json({ error: err.message });
    }
};

// ─── Notifications — fetch unread for a user ─────────────────────────────────
export const getNotifications = async (req, res) => {
    const { userId } = req.params;
    try {
        const [rows] = await db.query(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
            [userId]
        );
        const unreadCount = rows.filter(r => !r.is_read).length;
        return res.status(200).json({ notifications: rows, unreadCount });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const markNotificationsRead = async (req, res) => {
    const { userId } = req.params;
    try {
        await db.query('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [userId]);
        return res.status(200).json({ success: true });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
