import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
        select: false, // Never return password in queries by default
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'superadmin'],
        default: 'user',
    }
}, {
    timestamps: true
});

// Avoid OverwriteModelError in Next.js when hot-reloading
export default mongoose.models.User || mongoose.model('User', userSchema);
