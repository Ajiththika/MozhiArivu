import mongoose from 'mongoose';

const eventJoinRequestSchema = new mongoose.Schema(
    {
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event',
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        message: {
            type: String,
            trim: true,
            default: '',
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        reviewedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

// One user cannot have more than one pending request for the same event
eventJoinRequestSchema.index(
    { eventId: 1, userId: 1 },
    {
        unique: true,
        partialFilterExpression: { status: 'pending' },
    }
);

export default mongoose.model('EventJoinRequest', eventJoinRequestSchema);
