import express from 'express';
const router = express.Router();

// Controllers import
import * as adminController from '../controllers/adminController.js';
import * as jobController from '../controllers/jobController.js';
// updateRound function-ai direct-ah import panreenga
import { updateRound } from '../controllers/jobController.js';

const { addJob } = adminController;
const { getApplications } = jobController; 

// --- ROUTES ---

// Job add panna
router.post('/add-job', addJob); 

// Ellaa applications-aiyum edukka
router.get('/applications', getApplications);

/**
 * 404 ERROR FIX:
 * Frontend-la neenga 'axios.put('http://localhost:5000/api/admin/update-round', ...)' nu anupureenga.
 * So, backend-laiyum path '/update-round' nu thaan irukanum.
 */
router.put('/update-round', updateRound);

export default router;