// f:\Uki\Final Project\Tamil Learning Platform\backend\models\userModel.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
        required: true
    },
    passwordHash: {
        type: String,
        select: false
    },
    googleId: {
        type: String,
        sparse: true
    },
    googleProfile: {
        name: String,
        avatar: String
    },
    role: {
        type: String,
        enum: ['SUPER_ADMIN', 'ADMIN', 'USER_STUDENT', 'USER_PARENT'],
        default: 'USER_STUDENT'
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE', 'BANNED', 'PENDING'],
        default: 'PENDING'
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    authProviders: {
        type: [String],
        default: ['email'] // Can be ['email'], ['google'], ['email','google']
    },
    // Teacher-specific
    assignedStudents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    teacherCode: {
        type: String,
        sparse: true,
        unique: true
    },
    // Student-specific
    enrolledTeacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    gradeLevel: {
        type: String
    },
    // Parent-specific
    linkedStudents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    // Security fields
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date
    },
    lastLoginAt: {
        type: Date
    },
    lastLoginIp: {
        type: String
    },
    passwordChangedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Instance methods
userSchema.methods.isLocked = function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
};

userSchema.methods.incrementLoginAttempts = function () {
    // exponential backoff
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $set: { loginAttempts: 1, lockUntil: undefined }
        });
    }

    const updates = { $inc: { loginAttempts: 1 } };
    const attempts = this.loginAttempts + 1;
    const limits = [
        { attempts: 8, time: 60 * 60 * 1000 },  // 60 min lock
        { attempts: 7, time: 15 * 60 * 1000 },  // 15 min lock
        { attempts: 6, time: 5 * 60 * 1000 },   // 5 min lock
        { attempts: 5, time: 1 * 60 * 1000 }    // 1 min lock
    ];

    for (const limit of limits) {
        if (attempts >= limit.attempts) {
            updates.$set = { lockUntil: Date.now() + limit.time };
            break;
        }
    }

    return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = function () {
    return this.updateOne({
        $set: { loginAttempts: 0, lockUntil: undefined }
    });
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
    }
    return false;
};

userSchema.methods.toSafeObject = function () {
    const obj = this.toObject();
    delete obj.passwordHash;
    delete obj.loginAttempts;
    delete obj.lockUntil;
    return obj;
};

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
