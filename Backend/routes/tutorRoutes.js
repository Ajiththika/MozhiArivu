import { Router } from 'express';
import * as tutorController from '../controllers/tutorController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { z } from 'zod';

const router = Router();

const requestTutorSchema = z.object({
    tutorId: z.string().min(1, 'Tutor ID needed'),
    lessonId: z.string().optional(),
    questionText: z.string().min(1, 'Question text cannot be empty'),
}).strict();

const respondTutorSchema = z.object({
    response: z.string().min(1, 'Response text cannot be empty'),
}).strict();

// ── Public (Learner) ────────────────────────────────────────────────────────
// Browse available tutors (from User model where isTutorAvailable is true)
router.get('/available', authenticate, tutorController.listAvailableTutors);

// Request a tutor's help
router.post('/request', authenticate, validate(requestTutorSchema), tutorController.requestTutor);

// View learner's own requests
router.get('/my-requests', authenticate, tutorController.getLearnerRequests);

// ── Tutor Specific ──────────────────────────────────────────────────────────
// These endpoint implementations implicitly check if req.user is the assigned tutor
router.get('/pending', authenticate, tutorController.getTutorPendingRequests);
router.patch('/requests/:id/accept', authenticate, tutorController.acceptRequest);
router.patch('/requests/:id/decline', authenticate, tutorController.declineRequest);
router.patch('/requests/:id/resolve', authenticate, validate(respondTutorSchema), tutorController.resolveRequest);

export default router;
