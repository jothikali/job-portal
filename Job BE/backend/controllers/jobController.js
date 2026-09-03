import db from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// --- 1. Login User ---
// Handles plain-text legacy passwords AND bcrypt hashes.
// Auto-migrates plain-text to bcrypt on first successful login.
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ status: "Error", message: "Email and password are required" });
    }

    try {
        const [data] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

        if (data.length === 0) {
            return res.status(401).json({ status: "Error", message: "User not found" });
        }

        const userInDB = data[0];
        const storedPassword = userInDB.password;
        let isMatch = false;

        // bcrypt hashes always start with $2a$ or $2b$
        const isBcryptHash = typeof storedPassword === 'string' &&
                             storedPassword.startsWith('$2');

        if (isBcryptHash) {
            isMatch = await bcrypt.compare(password, storedPassword);
        } else {
            // Legacy plain-text comparison
            isMatch = (password === storedPassword);
            if (isMatch) {
                // Auto-migrate: hash and save silently
                const hashed = await bcrypt.hash(password, 10);
                await db.query("UPDATE users SET password = ? WHERE id = ?", [hashed, userInDB.id]);
                console.log(`[Auth] Migrated plain-text → bcrypt for users.id=${userInDB.id}`);
            }
        }

        if (!isMatch) {
            return res.status(401).json({ status: "Error", message: "Invalid Password" });
        }

        const { password: _, ...userWithoutPassword } = userInDB;
        const secret = process.env.JWT_SECRET || 'dev_secret_change_in_production';
        const token  = jwt.sign({ id: userInDB.id }, secret, { expiresIn: '7d' });

        return res.status(200).json({ status: "Success", token, user: userWithoutPassword });

    } catch (err) {
        console.error("LOGIN ERROR:", err);
        return res.status(500).json({ message: "Database error", detail: err.message });
    }
};


// --- 2. Get All Jobs ---
export const getAllJobs = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM jobs");

        // ORE ORU VATTI DHAAN res anupanum
        return res.status(200).json(rows || []);

    } catch (err) {
        console.error("Backend Error:", err);
        // Error vandha inga oru response anupuvom
        if (!res.headersSent) {
            return res.status(500).json({ message: "Internal Server Error", error: err.message });
        }
    }
};

// --- 3. Get Job By ID ---
export const getJobById = async (req, res) => {
    const { id } = req.params;
    try {
        const [data] = await db.query("SELECT * FROM jobs WHERE id = ?", [id]);
        if (data.length === 0) return res.status(404).json({ message: "Job not found" });
        return res.status(200).json(data[0]);
    } catch (err) {
        return res.status(500).json({ error: "Database error" });
    }
};

// --- 4. Post a Job ---
export const postJob = async (req, res) => {
    const { title, company, location, salary } = req.body;

    // Validation: Professional-ah basic check pannanum
    if (!title || !company) return res.status(400).json({ message: "Fields missing" });

    try {
        const sql = "INSERT INTO jobs (title, company, location, salary) VALUES (?, ?, ?, ?)";
        const [result] = await db.query(sql, [title, company, location, salary]);
        return res.status(201).json({ status: "Success", id: result.insertId });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// --- 5. Get Candidates & Applications ---
export const getCandidates = async (req, res) => {
    try {
        const [data] = await db.query("SELECT * FROM candidates");
        return res.status(200).json(data);
    } catch (err) {
        return res.status(500).json(err);
    }
};


// --- 6. Save a Job (Bookmark) ---
export const saveJob = async (req, res) => {
    const { userId, jobId } = req.body;

    if (!userId || !jobId) {
        return res.status(400).json({ message: "User ID or Job ID missing" });
    }

    try {
        // Check if already saved
        const checkSql = "SELECT * FROM saved_jobs WHERE user_id = ? AND job_id = ?";
        const [existing] = await db.query(checkSql, [userId, jobId]);

        if (existing.length > 0) {
            return res.status(409).json({ message: "Job already saved" });
        }

        // Insert new save
        const sql = "INSERT INTO saved_jobs (user_id, job_id) VALUES (?, ?)";
        await db.query(sql, [userId, jobId]);

        return res.status(200).json({ status: "Success", message: "Job saved successfully" });
    } catch (err) {
        console.error("Save Job Error:", err);
        return res.status(500).json({ message: "Database error", error: err.message });
    }
};

// --- 7. Get Saved Jobs for a User ---
export const getSavedJobs = async (req, res) => {
    const { userId } = req.params;

    try {
        const sql = `
            SELECT jobs.* FROM jobs 
            JOIN saved_jobs ON jobs.id = saved_jobs.job_id 
            WHERE saved_jobs.user_id = ?`;

        const [savedJobs] = await db.query(sql, [userId]);
        return res.status(200).json(savedJobs);
    } catch (err) {
        console.error("Fetch Saved Jobs Error:", err);
        return res.status(500).json({ message: "Database error", error: err.message });
    }
};
// --- 8. Remove Saved Job (Async/Await Style) ---
export const removeSavedJob = async (req, res) => {
    const { userId, jobId } = req.params;
    const sql = "DELETE FROM saved_jobs WHERE user_id = ? AND job_id = ?";

    try {
        // Matha function maariye idhaiyum await use panni maathittaen
        const [result] = await db.query(sql, [userId, jobId]);

        return res.status(200).json({
            status: "Success",
            message: "Job removed successfully"
        });
    } catch (err) {
        console.error("Remove Job Error:", err);
        return res.status(500).json({
            message: "Database error",
            error: err.message
        });
    }
};

// --- 9. Get Applied Jobs (Updated with missing fields) ---
export const getAppliedJobs = async (req, res) => {
    const { userId } = req.params;

    const query = `
        SELECT 
            a.id,
            a.status,
            a.applied_date,
            a.interview_date, 
            a.interview_time, 
            a.interview_link,
            a.skills AS user_skills,
            a.status_history,
            j.title,
            j.company,
            j.location,
            j.description AS job_description,
            u.username AS user_name,
            u.email AS user_email
        FROM applications a
        INNER JOIN jobs j ON a.job_id = j.id
        INNER JOIN users u ON a.user_id = u.id
        WHERE a.user_id = ?
    `;

    try {
        const [results] = await db.query(query, [userId]);
        return res.status(200).json(results);
    } catch (err) {
        console.error("SQL Error:", err);
        return res.status(500).json({ error: "Database error" });
    }
};
// controllers/jobController.js -> Function 10 update
export const applyForJob = async (req, res) => {
    const { userId, jobId, skills } = req.body;
    const resume_path = req.file ? req.file.filename : null;

    try {
        const [existing] = await db.query(
            "SELECT id FROM applications WHERE user_id = ? AND job_id = ?",
            [userId, jobId]
        );

        if (existing.length > 0) {
            return res.status(409).json({ message: "Already applied!" });
        }

        // 🟢 CHANGE: Status 'Pending' nu veikanum. 
        // Interview details (date/link/time) ellam ippo NULL-ah dhaan irukanum.
        const sql = `
            INSERT INTO applications 
            (user_id, job_id, applied_date, status, resume_path, skills) 
            VALUES (?, ?, NOW(), 'Pending', ?, ?)`;

        await db.query(sql, [userId, jobId, resume_path, skills]);

        res.status(201).json({ status: "Success", message: "Application sent to Admin for review!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
// --- 11. Get Interviews for a User (FIXED to include skills) ---
export const getInterviews = async (req, res) => {
    const { userId } = req.params;
    try {
        const sql = `
            SELECT 
                applications.id, 
                jobs.title, 
                jobs.company, 
                applications.interview_date, 
                applications.interview_time, 
                'Online' as type,
                applications.interview_link,
                applications.skills,
                jobs.location 
            FROM applications 
            JOIN jobs ON applications.job_id = jobs.id 
            WHERE applications.user_id = ? 
            AND applications.status = 'Interview' -- 👈 Idhu strictly Interview status-ah dhaan irukanum
            AND applications.interview_date >= CURDATE() -- 👈 Future interviews mattum
            ORDER BY applications.interview_date ASC`;

        const [rows] = await db.query(sql, [userId]);
        return res.status(200).json(rows);
    } catch (err) {
        console.error("Fetch Interviews Error:", err);
        return res.status(500).json({ message: "Database error", error: err.message });
    }
};


// --- 12. Get Archived Jobs (Withdrawn + Past Interviews + Rejected) ---
export const getArchivedJobs = async (req, res) => {
    const { userId } = req.params;
    try {
        const sql = `
            SELECT 
                applications.id, 
                jobs.title, 
                jobs.company,
                jobs.location,
                jobs.salary,
                jobs.type,
                jobs.description AS job_description, 
                applications.status, 
                applications.applied_date, 
                applications.interview_date, 
                applications.interview_time, 
                applications.interview_link,
                applications.skills,
                users.username AS user_name,  
                users.email AS user_email    
            FROM jobs 
            INNER JOIN applications ON jobs.id = applications.job_id 
            INNER JOIN users ON applications.user_id = users.id 
            WHERE applications.user_id = ? 
            AND (
                applications.status = 'Withdrawn' 
                OR applications.status = 'Rejected' 
                OR applications.status = 'Completed'
                OR (
                    applications.status = 'Interview' 
                    AND STR_TO_DATE(CONCAT(applications.interview_date, ' ', applications.interview_time), '%Y-%m-%d %H:%i:%s') < NOW()
                )
            )
            ORDER BY applications.applied_date DESC`;

        const [rows] = await db.query(sql, [userId]);
        return res.status(200).json(rows);
    } catch (err) {
        console.error("Archive Fetch Error:", err);
        return res.status(500).json({ error: err.message });
    }
};

// --- 13. Signup User ---
export const signupUser = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ status: "Error", message: "All fields are required" });
    }

    try {
        const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email]);

        if (existing.length > 0) {
            return res.status(409).json({ status: "Error", message: "Email already registered" });
        }

        // Always hash on signup — never store plain text
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.query(
            "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
            [username, email, hashedPassword]
        );

        return res.status(201).json({
            status: "Success",
            message: "Account created successfully!",
            userId: result.insertId
        });
    } catch (err) {
        console.error("Signup Error:", err);
        return res.status(500).json({ message: "Database error", error: err.message });
    }
};
export const withdrawApplication = async (req, res) => {
    const { applicationId } = req.params;
    try {
        // DELETE-ku badhila UPDATE status to 'Withdrawn'
        const sql = "UPDATE applications SET status = 'Withdrawn' WHERE id = ?";
        await db.query(sql, [applicationId]);

        return res.status(200).json({
            status: "Success",
            message: "Application moved to archive!"
        });
    } catch (err) {
        console.error("Withdraw Error:", err);
        return res.status(500).json({ error: err.message });
    }
};
export const getApplications = async (req, res) => {
    try {
        const sql = `
            SELECT 
                a.id, 
                u.username AS fullName, 
                u.email, 
                CASE 
                    WHEN a.status = 'Interview' AND STR_TO_DATE(CONCAT(a.interview_date, ' ', a.interview_time), '%Y-%m-%d %H:%i:%s') < NOW() 
                    THEN 'Completed' 
                    ELSE a.status 
                END AS status,
                a.applied_date AS appliedAt, 
                j.id AS job_id,
                j.title AS jobTitle,
                j.required_skills,
                a.interview_date,
                a.interview_time,
                a.resume_path, 
                a.skills,
                a.status_history
            FROM applications a
            JOIN users u ON a.user_id = u.id 
            JOIN jobs j ON a.job_id = j.id 
            ORDER BY a.applied_date DESC`;

        const [results] = await db.query(sql);
        return res.status(200).json(results);

    } catch (err) {
        console.error("Database Query Error:", err.message);
        return res.status(500).json({ error: "Failed to fetch applications" });
    }
};
export const applyJob = async (req, res) => {
    const { jobId, userId } = req.body;

    // req.file is created by Multer
    const resumePath = req.file ? req.file.filename : null;

    if (!resumePath) {
        return res.status(400).json({ message: "Resume upload failed!" });
    }

    try {
        const sql = "INSERT INTO applications (job_id, user_id, resume_path) VALUES (?, ?, ?)";
        await db.query(sql, [jobId, userId, resumePath]);
        return res.status(200).json({ status: "Success", message: "Applied successfully!" });
    } catch (err) {
        console.error("ApplyJob Error:", err);
        return res.status(500).json({ error: err.message });
    }
};

// controllers/jobController.js - kadasila add pannunga
export const approveForInterview = async (req, res) => {
    const { applicationId, interviewDate, interviewTime, interviewLink } = req.body;

    try {
        const sql = `
            UPDATE applications 
            SET status = 'Interview', 
                interview_date = ?, 
                interview_time = ?, 
                interview_link = ? 
            WHERE id = ?`;

        await db.query(sql, [interviewDate, interviewTime, interviewLink, applicationId]);

        res.status(200).json({ status: "Success", message: "Interview scheduled and user notified!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
// backend/controllers/jobController.js
// backend/controllers/jobController.js
export const updateRound = async (req, res) => {
    const { applicationId, status, date, time } = req.body;

    try {
        // 1. Fetch current status_history (JSON column) to append new entry
        const [rows] = await db.query(
            "SELECT status_history FROM applications WHERE id = ?",
            [applicationId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "Application not found" });
        }

        // 2. Parse existing history or start fresh
        let history = [];
        try {
            const raw = rows[0].status_history;
            history = raw ? JSON.parse(raw) : [];
        } catch (_) {
            history = [];
        }

        // 3. Append new audit entry
        const now = new Date();
        const timestamp = now.toLocaleString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true
        }).replace(',', '');
        history.push({ status, timestamp });

        // 4. Update status + schedule + history
        const sql = `
            UPDATE applications 
            SET status = ?, interview_date = ?, interview_time = ?, status_history = ?
            WHERE id = ?
        `;
        const [result] = await db.query(sql, [
            status, date, time, JSON.stringify(history), applicationId
        ]);

        if (result.affectedRows > 0) {
            return res.status(200).json({
                success: true,
                message: "Status and Schedule updated successfully"
            });
        } else {
            return res.status(404).json({ success: false, message: "Application not found" });
        }
    } catch (err) {
        console.error("SQL Error:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
};
// Get all Education Levels (No Limit)
export const getEduLevels = async (req, res) => {
    const searchTerm = req.query.q || '';
    try {
        // Query-la LIMIT-ah thookitta full data-vum varum
        const [rows] = await db.query(
            "SELECT level_name FROM edu_levels WHERE level_name LIKE ?",
            [`%${searchTerm}%`]
        );
        res.json(rows.map(row => row.level_name));
    } catch (err) {
        console.error("Error fetching edu levels:", err);
        res.status(500).json({ error: "Database error" });
    }
};

// Get all Education Fields (No Limit)
export const getEduFields = async (req, res) => {
    const searchTerm = req.query.q || '';
    try {
        // Query-la LIMIT-ah thookitta full data-vum varum
        const [rows] = await db.query(
            "SELECT field_name FROM edu_fields WHERE field_name LIKE ?",
            [`%${searchTerm}%`]
        );
        res.json(rows.map(row => row.field_name));
    } catch (err) {
        console.error("Error fetching edu fields:", err);
        res.status(500).json({ error: "Database error" });
    }
};
// --- Get Company Suggestions (Add this at the end of jobController.js) ---
export const getCompanySuggestions = async (req, res) => {
    const searchTerm = req.query.q || '';
    try {
        // 'jobs' table-la irukura unique company names-ah search pannum
        const [rows] = await db.query(
            "SELECT DISTINCT company FROM jobs WHERE company LIKE ?",
            [`%${searchTerm}%`]
        );
        // Result-ah array-va return pannuvom
        res.status(200).json(rows.map(row => row.company));
    } catch (err) {
        console.error("Error fetching company suggestions:", err);
        res.status(500).json({ error: "Database error" });
    }
};

// Get Driving License Suggestions
export const getDrivingLicenses = async (req, res) => {
    const searchTerm = req.query.q || '';
    try {
        const [rows] = await db.query(
            "SELECT license_type FROM driving_licenses WHERE license_type LIKE ?",
            [`%${searchTerm}%`]
        );
        res.json(rows.map(row => row.license_type));
    } catch (err) {
        console.error("Error fetching licenses:", err);
        res.status(500).json({ error: "Database error" });
    }
};
export const getCertifications = async (req, res) => {
    const searchTerm = req.query.q || '';
    try {
        const [rows] = await db.query(
            "SELECT cert_name FROM certifications_list WHERE cert_name LIKE ?",
            [`%${searchTerm}%`]
        );
        res.json(rows.map(row => row.cert_name));
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
};
export const getLanguages = async (req, res) => {
    const searchTerm = req.query.q || '';
    try {
        const [rows] = await db.query(
            "SELECT lang_name FROM languages_list WHERE lang_name LIKE ?",
            [`%${searchTerm}%`]
        );
        res.json(rows.map(row => row.lang_name));
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
};

export const getMasterTitles = async (req, res) => {
    const sql = "SELECT title_name FROM master_job_titles";
    try {
        // Neenga promise-based pool use pannreenga nu ninaikiren (based on your structure)
        const [rows] = await db.query(sql); 
        const titles = rows.map(row => row.title_name);
        res.status(200).json(titles);
    } catch (err) {
        console.error("Error fetching master titles:", err);
        res.status(500).json({ error: "Database error" });
    }
}

// controllers/jobController.js

export const saveJobPreferences = async (req, res) => {
    const { userId, jobTitles, jobTypes, workSchedule, minPay, remote, isWillingToRelocate } = req.body;
    
    try {
        // Step 1: Clean old data
        await db.query("DELETE FROM user_job_preferences WHERE user_id = ?", [userId]);

        // Step 2: Insert using the exact column names from your screenshot
        const sqlInsert = `
            INSERT INTO user_job_preferences 
            (user_id, job_title, job_types, work_schedule, min_pay, remote, is_willing_to_relocate) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        const values = [
            userId, 
            jobTitles || '',   // Already a string from frontend
            jobTypes || '',    // Already a string from frontend
            workSchedule || '', // Already a string from frontend
            minPay || '',
            remote || '', 
            isWillingToRelocate || 0
        ];

        await db.query(sqlInsert, values);
        res.status(200).json({ message: "Success" });

    } catch (err) {
        // terminal-la error-ai clear-ah paaka
        console.error("MYSQL ERROR:", err.sqlMessage); 
        res.status(500).json({ error: err.sqlMessage });
    }
};

export const getJobPreferences = async (req, res) => {
    const { userId } = req.params;
    try {
        const [rows] = await db.query("SELECT * FROM user_job_preferences WHERE user_id = ?", [userId]);
        if (rows.length > 0) {
            res.status(200).json(rows[0]);
        } else {
            // 404 vara koodathuna, data illana empty object anupuvom
            res.status(200).json({}); 
        }
    } catch (err) {
        console.error("Fetch Error:", err);
        res.status(500).json({ error: "Database error" });
    }
};

export const saveReadyToWorkStatus = async (req, res) => {
    const { userId, readyToWork } = req.body;
    
    try {
        // user_job_preferences table-la ready_to_work column-ai mattum update pannuroam
        const sqlUpdate = "UPDATE user_job_preferences SET ready_to_work = ? WHERE user_id = ?";
        
        // readyToWork (true/false) ah 1 or 0 ah mathuroam
        const values = [readyToWork ? 1 : 0, userId];

        await db.query(sqlUpdate, values);
        res.status(200).json({ message: "Ready to work status updated!" });
    } catch (err) {
        console.error("Status Update Error:", err);
        res.status(500).json({ error: "Database error" });
    }
};

export const moveCandidateToTechnical = async (req, res) => {
    const { applicationId, status, interview_date, interview_time, interview_link } = req.body;

    try {
        const sql = `
            UPDATE applications 
            SET status = ?, 
                interview_date = ?, 
                interview_time = ?, 
                interview_link = ? 
            WHERE id = ?`;

        const [result] = await db.query(sql, [status, interview_date, interview_time, interview_link, applicationId]);

        if (result.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Shortlisted for Technical Round!" });
        }
        return res.status(404).json({ message: "Candidate not found" });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};


