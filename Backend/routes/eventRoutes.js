import { Router } from 'express';
import * as eventController from '../controllers/eventController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { z } from 'zod';

const router = Router();

const createEventSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    date: z.string().datetime('Must be a valid ISO datetime'),
    durationMinutes: z.number().int().positive().optional(),
    meetLink: z.string().url().optional(),
    isPremiumOnly: z.boolean().optional(),
}).strict();

const updateEventSchema = createEventSchema.partial();

// Browse upcoming events
router.get('/', authenticate, eventController.listUpcomingEvents);

// Join an event
router.post('/:id/join', authenticate, eventController.joinEvent);

// Admin actions
router.post('/', authenticate, requireRole('admin'), validate(createEventSchema), eventController.createEvent);
router.patch('/:id', authenticate, requireRole('admin'), validate(updateEventSchema), eventController.updateEvent);
router.delete('/:id', authenticate, requireRole('admin'), eventController.deleteEvent);

export default router;
