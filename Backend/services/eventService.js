import Event from '../models/Event.js';
import User from '../models/User.js';

export async function getUpcomingEvents() {
    return Event.find({ date: { $gte: new Date() } }).sort('date');
}

export async function joinEvent(userId, eventId) {
    const event = await Event.findById(eventId);
    if (!event) {
        const err = new Error('Event not found.'); err.status = 404; err.code = 'NOT_FOUND'; throw err;
    }

    if (event.attendees.includes(userId)) {
        const err = new Error('User already joined this event.'); err.status = 409; err.code = 'ALREADY_JOINED'; throw err;
    }

    if (event.isPremiumOnly) {
        const user = await User.findById(userId);
        if (!user.isPremium) {
            const err = new Error('Premium upgrade required for this event.'); err.status = 403; err.code = 'PREMIUM_REQUIRED'; throw err;
        }
    }

    event.attendees.push(userId);
    await event.save();
    return event;
}

export async function createEvent(data) {
    return Event.create(data);
}

export async function updateEvent(eventId, updateData) {
    const event = await Event.findByIdAndUpdate(eventId, updateData, { new: true });
    if (!event) {
        const err = new Error('Event not found.'); err.status = 404; err.code = 'NOT_FOUND'; throw err;
    }
    return event;
}

export async function deleteEvent(eventId) {
    const event = await Event.findByIdAndDelete(eventId);
    if (!event) {
        const err = new Error('Event not found.'); err.status = 404; err.code = 'NOT_FOUND'; throw err;
    }
}
