import express from 'express';
const router = express.Router();

// Controllers-ah import panrom
import * as jobController from '../controllers/jobController.js';
import { updateFullProfile, getFullProfile, updateSummary } from '../controllers/authController.js';

// Middleware and DB import
import upload from '../middleware/upload.js';
import db from '../config/db.js';

// --- AUTH ROUTES ---
router.post('/signup', jobController.signupUser);
router.post('/login', jobController.loginUser);

// --- PROFILE ROUTES ---

// 1. Profile Update (Text details)
router.put('/update-profile/:id', updateFullProfile); 

// 2. Summary Update (Specific for Summary page)
router.put('/update-summary', updateSummary);

// 3. GET Profile (To display data in Frontend)
router.get('/full-profile/:id', getFullProfile); 


// --- RESUME ROUTES ---

// 4. RESUME UPLOAD 
// URL-la :id add pannirukaen, appo dhaan controller-ku entha user-nu theriyum
router.post('/upload-resume', upload.single('resume'), updateFullProfile);

// 5. RESUME DELETE
router.delete('/delete-resume/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // userId-ah correctly query-la kuduthu resume_url-ah null panrom
        await db.query("UPDATE user_profiles SET resume_url = NULL WHERE userId = ?", [id]);
        res.status(200).json({ status: "Success", message: "Resume deleted successfully! 🗑️" });
    } catch (err) {
        console.error("DELETE ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
router.post('/add-experience', async (req, res) => {
    const { userId, jobTitle, companyName } = req.body;
    try {
        await db.query("INSERT INTO user_experience (userId, jobTitle, companyName) VALUES (?, ?, ?)", [userId, jobTitle, companyName]);
        res.status(200).json({ message: "Experience saved" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});