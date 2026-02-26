import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret_for_dev_only';
const JWT_EXPIRES_IN = '15m'; // 15 minutes as requested

/**
 * Generate a JWT access token
 * @param {Object} payload - The token payload (must contain sub and role)
 * @returns {string} - The generated JWT token
 */
export const generateToken = (payload) => {
    // Ensuring payload only contains sub and role
    const { sub, role } = payload;
    return jwt.sign({ sub, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Verify a JWT access token
 * @param {string} token - The JWT token to verify
 * @returns {Object|null} - The decoded token payload or null if invalid
 */
export const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};
