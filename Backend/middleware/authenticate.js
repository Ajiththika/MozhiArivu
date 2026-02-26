// f:\Uki\Final Project\Tamil Learning Platform\backend\middleware\authenticate.js
import { tokenService } from '@/services/tokenService';
import Session from '@/models/sessionModel';
import User from '@/models/userModel';

export async function authenticate(request) {
    let token = request.cookies.get('at')?.value;

    if (!token) {
        const authHeader = request.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }
    }

    if (!token) {
        return { error: 'Not authenticated', status: 401 };
    }

    try {
        const decoded = tokenService.verifyAccessToken(token);

        const session = await Session.findById(decoded.sessionId);
        if (!session || !session.isActive) {
            return { error: 'Session invalid or expired', status: 401 };
        }

        const user = await User.findById(decoded.sub).select('-passwordHash');
        if (!user || user.status === 'BANNED') {
            return { error: 'User invalid or banned', status: 401 };
        }

        if (user.changedPasswordAfter(decoded.iat)) {
            return { error: 'Password changed recently. Please login again.', status: 401 };
        }

        return {
            user: {
                id: user._id.toString(),
                email: user.email,
                role: user.role,
                sessionId: decoded.sessionId
            }
        };
    } catch (error) {
        return { error: 'Invalid token', status: 401 };
    }
}
