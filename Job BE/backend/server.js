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

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();

// ─── CORS ────────────────────────────────────────────────────────────────────
// Strategy: explicit allowlist + pattern match for Vercel preview URLs.
// Set FRONTEND_URL=https://your-app.vercel.app in Render dashboard.

const EXPLICIT_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL,        // e.g. https://job-portal.vercel.app
].filter(Boolean);

// Also allow any *.vercel.app subdomain (covers preview deployments)
const VERCEL_PATTERN = /^https:\/\/[a-z0-9-]+(\.vercel\.app)$/i;

app.use(cors({
    origin: (origin, callback) => {
        // No origin = Postman / curl / server-to-server — allow
        if (!origin) return callback(null, true);

        // Check explicit list first
        if (EXPLICIT_ORIGINS.includes(origin)) return callback(null, true);

        // Allow any *.vercel.app (preview branches)
        if (VERCEL_PATTERN.test(origin)) return callback(null, true);

        console.warn(`[CORS] Blocked: ${origin}`);
        callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Must come before routes — handles pre-flight OPTIONS requests
app.options('*', cors());

app.use(express.json());

// ─── STATIC FILES ─────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── API ROUTES ───────────────────────────────────────────────────────────────
app.use('/api/qualifications', qualificationRoutes);
app.use('/api/auth',           authRoutes);
app.use('/api/jobs',           jobRoutes);
app.use('/api/reviews',        reviewRoutes);
app.use('/api/skills',         skillRoutes);
app.use('/api/admin',          adminRoutes);
app.use('/api/user',           authRoutes);
app.use('/api/aptitude',       aptitudeRoutes);

// Health check
app.get('/', (_req, res) => res.send('Server is running successfully! 🚀'));

// ─── GLOBAL ERROR HANDLER ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
    console.error('[Error]', err.message);
    res.status(500).json({ error: err.message || 'Internal server error' });
});

// ─── START ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} 🚀`);
    console.log(`Allowed origins: ${EXPLICIT_ORIGINS.join(', ')} + *.vercel.app`);
});