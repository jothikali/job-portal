import express from 'express';
const router = express.Router();

import * as adminController from '../controllers/adminController.js';
import * as jobController from '../controllers/jobController.js';
import { updateRound } from '../controllers/jobController.js';

const { addJob, getJobFunnelStats } = adminController;
const { getApplications } = jobController;

// --- ROUTES ---
router.post('/add-job', addJob);
router.get('/applications', getApplications);
router.put('/update-round', updateRound);

// Job analytics funnel stats (all jobs in one call)
router.get('/job-funnel-stats', getJobFunnelStats);

export default router;