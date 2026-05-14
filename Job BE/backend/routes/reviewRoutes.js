import express from 'express';
const router = express.Router();

// 1. Change require to import and ADD the .js extension
// Make sure this file exists in your controllers folder!
import { getReviews, addReview } from '../controllers/reviewController.js'; 

router.get('/', getReviews);
router.post('/', addReview);

// 2. Change module.exports to export default
export default router;