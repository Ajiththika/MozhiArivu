import * as eventService from '../services/eventService.js';

export async function listUpcomingEvents(req, res, next) {
    try {
        const events = await eventService.getUpcomingEvents();
        res.json({ events });
    } catch (e) { next(e); }
}

export async function joinEvent(req, res, next) {
    try {
        // Evaluate premium status dynamically during join
        const event = await eventService.joinEvent(req.user.sub, req.params.id);
        res.json({ message: 'Successfully joined the event.', event });
    } catch (e) { next(e); }
}

export async function createEvent(req, res, next) {
    try {
        const event = await eventService.createEvent(req.body);
        res.status(201).json({ event });
    } catch (e) { next(e); }
}

export async function updateEvent(req, res, next) {
    try {
        const event = await eventService.updateEvent(req.params.id, req.body);
        res.json({ event });
    } catch (e) { next(e); }
}

export async function deleteEvent(req, res, next) {
    try {
        await eventService.deleteEvent(req.params.id);
        res.json({ message: 'Event deleted successfully.' });
    } catch (e) { next(e); }
}
