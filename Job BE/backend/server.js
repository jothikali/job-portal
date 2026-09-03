import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// 1. IMPORT ROUTES
import authRoutes from './routes/authRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import skillRoutes from './routes/skillRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import qualificationRoutes from './routes/qualificationRoutes.js';
import aptitudeRoutes from './routes/aptitudeRoutes.js';

dotenv.config();

// 2. SETUP __dirname (ESM-ku idhu thaan correct method)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 3. GLOBAL MIDDLEWARES

// Allowed origins: local dev + Vercel production
// Set FRONTEND_URL in Render environment variables to your Vercel URL
// e.g. FRONTEND_URL=https://your-app.vercel.app
const allowedOrigins = [
    'http://localhost:5173',   // Vite dev server default
    'http://localhost:3000',   // fallback
    process.env.FRONTEND_URL,  // Vercel production URL (set in Render dashboard)
].filter(Boolean); // remove undefined if FRONTEND_URL not set yet

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (Postman, mobile apps, server-to-server)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS blocked: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// 4. STATIC FOLDER SETUP (MIGAVUM MUKKIYAM)
// Intha line-la thaan browser-ku unga uploads folder permission kidaikkum
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 5. API ROUTES
app.use('/api/qualifications', qualificationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/skills', skillRoutes); 
app.use('/api/admin', adminRoutes);
app.use('/api/user', authRoutes);
app.use('/api/aptitude', aptitudeRoutes);

// Root route
app.get('/', (req, res) => {
    res.send("Server is running successfully! 🚀");
});

// 6. SERVER START
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} 🚀`);
    console.log(`Static path check: ${path.join(__dirname, 'uploads')}`);
});