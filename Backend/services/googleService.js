// f:\Uki\Final Project\Tamil Learning Platform\backend\services\googleService.js
import User from '@/models/userModel';
import StudentProfile from '@/models/studentProfileModel';
import AuditLog from '@/models/auditLogModel';

export const googleService = {
    async findOrCreateGoogleUser(profile, ip, userAgent) {
        let user = await User.findOne({ googleId: profile.id });
        if (user) {
            if (user.status === 'BANNED') {
                throw new Error('This account has been banned.');
            }
            user.lastLoginAt = new Date();
            user.lastLoginIp = ip;
            await user.save();
            await AuditLog.create({ userId: user._id, action: 'LOGIN_GOOGLE', ip, userAgent });
            return user;
        }

        user = await User.findOne({ email: profile.email });
        if (user) {
            if (user.status === 'BANNED') {
                throw new Error('This account has been banned.');
            }
            if (user.googleId && user.googleId !== profile.id) {
                throw new Error('Account linked to a different Google profile.');
            }
            user.googleId = profile.id;
            user.googleProfile = { name: profile.name, avatar: profile.picture };
            if (!user.authProviders.includes('google')) {
                user.authProviders.push('google');
            }
            user.lastLoginAt = new Date();
            user.lastLoginIp = ip;
            await user.save();
            await AuditLog.create({ userId: user._id, action: 'LOGIN_GOOGLE', ip, userAgent });
            return user;
        }

        user = new User({
            email: profile.email,
            googleId: profile.id,
            googleProfile: { name: profile.name, avatar: profile.picture },
            emailVerified: true,
            status: 'ACTIVE',
            role: 'USER_STUDENT',
            authProviders: ['google'],
            lastLoginAt: new Date(),
            lastLoginIp: ip
        });
        await user.save();
        await StudentProfile.create({ studentId: user._id });
        await AuditLog.create({ userId: user._id, action: 'LOGIN_GOOGLE', ip, userAgent });
        return user;
    }
};
