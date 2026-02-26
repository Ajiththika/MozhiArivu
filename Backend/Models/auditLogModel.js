// f:\Uki\Final Project\Tamil Learning Platform\backend\models\auditLogModel.js
import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // nullable for failed logins with missing user
    },
    action: {
        type: String,
        enum: [
            'REGISTER', 'LOGIN', 'LOGIN_GOOGLE', 'LOGOUT',
            'LOGIN_FAILED', 'PASSWORD_RESET', 'PASSWORD_CHANGED',
            'EMAIL_VERIFIED', 'ACCOUNT_LOCKED', 'SESSION_REVOKED',
            'ROLE_CHANGED', 'STUDENT_ADDED', 'PARENT_LINKED',
            'TEACHER_CREATED', 'STUDENT_BANNED'
        ],
        required: true
    },
    ip: String,
    userAgent: String,
    metadata: mongoose.Schema.Types.Mixed,
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '90d' // auto-delete after 90 days
    }
});

const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
