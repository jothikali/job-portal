import express from 'express';
const router = express.Router();
import { getQuestions, submitTest,getAdminResults } from '../controllers/aptitudeController.js';

// Define endpoints
router.get('/questions', getQuestions);
router.post('/submit-test', submitTest);
router.get('/admin/results', getAdminResults);

export default router;