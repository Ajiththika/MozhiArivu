// f:\Uki\Final Project\Tamil Learning Platform\backend\services\tokenService.js
import jwt from 'jsonwebtoken';
import { jwtConfig } from '@/config/jwtConfig';
import Session from '@/models/sessionModel';
import crypto from 'crypto';

export const tokenService = {
    signAccessToken({ userId, email, role, sessionId }) {
        return jwt.sign(
            {
                sub: userId,
                email,
                role,
                sessionId,
                jti: crypto.randomUUID()
            },
            jwtConfig.accessSecret,
            { expiresIn: jwtConfig.accessExpiresIn, issuer: jwtConfig.issuer }
        );
    },



    verifyAccessToken(token) {
        return jwt.verify(token, jwtConfig.accessSecret);
    },



    async revokeSession(sessionId) {
        return await Session.findByIdAndUpdate(sessionId, { isActive: false });
    },

    async revokeAllUserSessions(userId) {
        return await Session.updateMany({ userId }, { isActive: false });
    }
};
