import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    date: { type: Date, required: true },
    durationMinutes: { type: Number, default: 60 },
    meetLink: { type: String },
    isPremiumOnly: { type: Boolean, default: false },
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

export default mongoose.model('Event', eventSchema);
