/**
 * Central API base URL — reads from Vite env at build time.
 * Set VITE_API_URL in:
 *   - .env.local       → http://localhost:5000/api  (local dev)
 *   - Vercel dashboard → https://job-portal-api.onrender.com/api  (production)
 *
 * Usage:
 *   import { API, UPLOADS } from '../lib/api';
 *   fetch(`${API}/auth/login`, ...)
 *   axios.get(`${API}/jobs`)
 *   window.open(`${UPLOADS}/resumes/file.pdf`)
 */
export const API = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

// Base URL for static file serving (Render's /uploads folder)
// Derived from API by stripping the trailing /api segment
export const UPLOADS = API.replace(/\/api$/, '') + '/uploads';
