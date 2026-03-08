import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { initGoogle } from './services/googleService.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';
import lessonRoutes from './routes/lessonRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import tutorRoutes from './routes/tutorRoutes.js';
import { errorHandler } from './middleware/error.js';

const app = express();

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_ORIGIN,
    credentials: true,
}));

// ── Body / Cookie ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());

// ── Google OAuth (passport) ───────────────────────────────────────────────────
initGoogle(app);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tutors', tutorRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ── Error Handler ─────────────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
