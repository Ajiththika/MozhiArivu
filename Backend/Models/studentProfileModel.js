// f:\Uki\Final Project\Tamil Learning Platform\backend\models\studentProfileModel.js
import mongoose from 'mongoose';

const studentProfileSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        unique: true,
        required: true
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    progress: {
        totalLessonsCompleted: { type: Number, default: 0 },
        totalQuizzesTaken: { type: Number, default: 0 },
        averageQuizScore: { type: Number, default: 0 },
        totalTimeSpentMinutes: { type: Number, default: 0 },
        currentStreak: { type: Number, default: 0 },
        lastActivityAt: Date
    },
    lessonHistory: [{
        lessonId: mongoose.Schema.Types.ObjectId,
        lessonTitle: String,
        completedAt: Date,
        timeSpentMins: Number,
        score: Number
    }],
    quizHistory: [{
        quizId: mongoose.Schema.Types.ObjectId,
        quizTitle: String,
        score: Number,
        totalQuestions: Number,
        attemptedAt: Date,
        passed: Boolean
    }],
    notes: String,
    parentCanView: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const StudentProfile = mongoose.models.StudentProfile || mongoose.model('StudentProfile', studentProfileSchema);
export default StudentProfile;
