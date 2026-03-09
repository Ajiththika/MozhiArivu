import mongoose from 'mongoose';

const tutorRequestSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }, // optional context
    question: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'declined', 'answered', 'resolved'],
        default: 'pending'
    },
    teacherAnswer: { type: String }, // Provided when resolved
    priceCredits: { type: Number, default: 10 }, // Cost of the request
}, { timestamps: true });

export default mongoose.model('TutorRequest', tutorRequestSchema);
