// f:\Uki\Final Project\Tamil Learning Platform\backend\models\parentStudentLinkModel.js
import mongoose from 'mongoose';

const parentStudentLinkSchema = new mongoose.Schema({
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING'
    },
    requestedAt: {
        type: Date,
        default: Date.now
    },
    approvedAt: Date,
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

parentStudentLinkSchema.index({ parentId: 1, studentId: 1 }, { unique: true });

const ParentStudentLink = mongoose.models.ParentStudentLink || mongoose.model('ParentStudentLink', parentStudentLinkSchema);
export default ParentStudentLink;
