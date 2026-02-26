// f:\Uki\Final Project\Tamil Learning Platform\backend\services\authService.js
import User from '@/models/userModel';
import Session from '@/models/sessionModel';
import StudentProfile from '@/models/studentProfileModel';
import ParentStudentLink from '@/models/parentStudentLinkModel';
import AuditLog from '@/models/auditLogModel';
import { validatePassword } from '@/lib/passwordValidation';
import { tokenService } from '@/services/tokenService';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export const authService = {
    async register(data, ip, userAgent) {
        const { email, password, role, teacherCode, studentEmail } = data;

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            throw new Error(passwordValidation.errors.join(', '));
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            // Generic error to prevent user enumeration
            throw new Error('Email is already registered or invalid.');
        }

        const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
        const passwordHash = await bcrypt.hash(password, rounds);

        const user = new User({
            email,
            passwordHash,
            role,
            status: 'PENDING',
            authProviders: ['email']
        });

        await user.save();

        if (role === 'USER_STUDENT') {
            await StudentProfile.create({ studentId: user._id });

            if (teacherCode) {
                const teacher = await User.findOne({ teacherCode, role: { $in: ['ADMIN', 'SUPER_ADMIN'] } });
                if (teacher) {
                    await User.findByIdAndUpdate(teacher._id, { $addToSet: { assignedStudents: user._id } });
                    await User.findByIdAndUpdate(user._id, { enrolledTeacher: teacher._id });
                }
            }
        } else if (role === 'USER_PARENT') {
            if (studentEmail) {
                const student = await User.findOne({ email: studentEmail, role: 'USER_STUDENT' });
                if (student) {
                    await ParentStudentLink.create({ parentId: user._id, studentId: student._id, status: 'PENDING' });
                }
            }
        }

        await AuditLog.create({
            userId: user._id,
            action: 'REGISTER',
            ip,
            userAgent
        });

        const sessionData = await this.createSession(user._id, ip, userAgent);

        const accessToken = tokenService.signAccessToken({
            userId: user._id,
            email: user.email,
            role: user.role,
            sessionId: sessionData.session._id
        });

        return { accessToken, refreshToken: sessionData.rawRefreshToken, user: user.toSafeObject() };
    },

    async login(email, password, ip, userAgent) {
        const user = await User.findOne({ email }).select('+passwordHash');
        if (!user) {
            throw new Error('Invalid email or password');
        }

        if (user.isLocked()) {
            const error = new Error('Too many failed login attempts');
            error.status = 423;
            error.retryAfter = Math.ceil((user.lockUntil - Date.now()) / 1000);
            throw error;
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash || '');
        if (!isMatch) {
            await user.incrementLoginAttempts();
            await AuditLog.create({ userId: user._id, action: 'LOGIN_FAILED', ip, userAgent });
            throw new Error('Invalid email or password');
        }

        await user.resetLoginAttempts();
        user.lastLoginAt = new Date();
        user.lastLoginIp = ip;
        await user.save();

        if (!user.emailVerified) {
            // Assuming you might block or allow, following structure allows if needed, but normally throws:
            // throw new Error('Please verify your email address before logging in.');
        }

        if (user.status === 'BANNED') {
            throw new Error('This account has been banned.');
        }

        await AuditLog.create({ userId: user._id, action: 'LOGIN', ip, userAgent });

        const sessionData = await this.createSession(user._id, ip, userAgent);

        const accessToken = tokenService.signAccessToken({
            userId: user._id,
            email: user.email,
            role: user.role,
            sessionId: sessionData.session._id
        });

        return { accessToken, refreshToken: sessionData.rawRefreshToken, user: user.toSafeObject() };
    },

    async logout(userId, sessionId) {
        await tokenService.revokeSession(sessionId);
        await AuditLog.create({ userId, action: 'LOGOUT' });
    },

    async refreshTokens(refreshTokenRaw) {
        const hash = crypto.createHash('sha256').update(refreshTokenRaw).digest('hex');
        const session = await Session.findOne({ refreshTokenHash: hash });

        if (!session || !session.isActive || session.expiresAt < new Date()) {
            throw new Error('Invalid session');
        }

        await tokenService.revokeSession(session._id);

        const user = await User.findById(session.userId);
        if (!user || user.status === 'BANNED' || user.isLocked()) {
            throw new Error('User inactive or banned');
        }

        const sessionData = await this.createSession(user._id, session.ipAddress, session.deviceInfo.userAgent);

        const accessToken = tokenService.signAccessToken({
            userId: user._id,
            email: user.email,
            role: user.role,
            sessionId: sessionData.session._id
        });

        return { accessToken, refreshToken: sessionData.rawRefreshToken };
    },

    async createSession(userId, ip, userAgent) {
        const tokenBytes = crypto.randomBytes(40).toString('hex');
        const refreshTokenHash = crypto.createHash('sha256').update(tokenBytes).digest('hex');

        const session = await Session.create({
            userId,
            refreshTokenHash,
            deviceInfo: { userAgent },
            ipAddress: ip,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });

        return { session, rawRefreshToken: tokenBytes };
    }
};
