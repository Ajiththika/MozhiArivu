import { verifyToken } from '../lib/jwt';

export const authenticate = (request) => {
    // Look for Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { error: 'Unauthorized', status: 401 };
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return { error: 'Unauthorized', status: 401 };
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
        return { error: 'Invalid or expired token', status: 401 };
    }

    return { user: decoded };
};
