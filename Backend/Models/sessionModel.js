// f:\Uki\Final Project\Tamil Learning Platform\backend\models\sessionModel.js
import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true,
        required: true
    },
    refreshTokenHash: {
        type: String,
        required: true
    },
    deviceInfo: {
        userAgent: String,
        browser: String,
        os: String
    },
    ipAddress: String,
    isActive: {
        type: Boolean,
        default: true
    },
    lastUsedAt: Date,
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: '1s' } // TTL index automatically deletes expired sessions
    }
}, {
    timestamps: true
});

const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema);
export default Session;
