import express from 'express';
import upload from '../middleware/upload.js'; 
import * as jobController from '../controllers/jobController.js';
import * as adminController from '../controllers/adminController.js';

const router = express.Router();

// Destructuring from the imported controllers
const { 
    saveJob, 
    getSavedJobs, 
    removeSavedJob, 
    getAppliedJobs, 
    getApplications, 
    applyForJob,
    loginUser,
    signupUser,
    getAllJobs,
    getJobById,
    postJob,
    getCandidates,
    getInterviews, 
    getArchivedJobs,
    withdrawApplication,
    getEduFields, 
    getEduLevels ,
    getCompanySuggestions ,
    getDrivingLicenses,
    getCertifications,
    getLanguages,
    getMasterTitles,
     saveJobPreferences,
     getJobPreferences,
     saveReadyToWorkStatus
} = jobController;

const { 
    getAdminStats, 
    deleteJob, 
    updateJob 
} = adminController;

// --- 1. AUTH ROUTES ---
router.post('/login', loginUser);
router.post('/signup', signupUser);

// --- 2. SPECIFIC GET ROUTES ---
router.get('/applied-jobs/:userId', getAppliedJobs);
router.get('/saved-jobs/:userId', getSavedJobs);
router.get('/interviews/:userId', getInterviews);
router.get('/candidates', getCandidates);
router.get('/applications', getApplications); 
router.get('/archive/:userId', getArchivedJobs);

// --- 3. ADMIN/MANAGE ROUTES ---
router.get('/stats', getAdminStats); 
router.put('/update-job/:id', updateJob);
router.delete('/delete-job/:id', deleteJob);

// --- 4. EDUCATION & SKILL SUGGESTIONS ---
// Direct-ah destructured function names use pannunga
router.get('/edu-levels', getEduLevels);
router.get('/edu-fields', getEduFields);
router.get('/company-suggestions', getCompanySuggestions);
router.get('/driving-licenses', getDrivingLicenses);
router.get('/certifications', getCertifications);
router.get('/languages', getLanguages);
router.get('/master-titles', getMasterTitles);
router.post('/save-preferences', saveJobPreferences);

router.get('/get-preferences/:userId', getJobPreferences);
router.post('/save-ready-status', saveReadyToWorkStatus);
// --- 5. DYNAMIC & GENERAL ROUTES ---
router.get('/', getAllJobs);
router.get('/:id', getJobById); 

// --- 6. POST & DELETE ROUTES ---
router.post('/apply', upload.single('resume'), applyForJob);
router.post('/', postJob);
router.post('/save-job', saveJob);
router.put('/withdraw/:applicationId', withdrawApplication);
router.delete('/remove-saved-job/:userId/:jobId', removeSavedJob);

export default router;