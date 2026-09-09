import express from 'express';
const router = express.Router();

import * as adminController from '../controllers/adminController.js';
import * as jobController from '../controllers/jobController.js';
import { updateRound } from '../controllers/jobController.js';

const {
    addJob, getJobFunnelStats, shortlistCandidate,
    bulkUpdateStatus, getAnalytics,
    getNotifications, markNotificationsRead
} = adminController;
const { getApplications } = jobController;

router.post('/add-job',            addJob);
router.get('/applications',        getApplications);
router.put('/update-round',        updateRound);
router.get('/job-funnel-stats',    getJobFunnelStats);
router.post('/shortlist-candidate', shortlistCandidate);
router.post('/bulk-update-status', bulkUpdateStatus);
router.get('/analytics',           getAnalytics);
router.get('/notifications/:userId',       getNotifications);
router.put('/notifications/:userId/read',  markNotificationsRead);

export default router;