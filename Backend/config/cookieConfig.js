// f:\Uki\Final Project\Tamil Learning Platform\backend\config\cookieConfig.js

const isProduction = process.env.NODE_ENV === 'production';

export const accessTokenCookie = {
    name: 'at',
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    path: '/',
    maxAge: 15 * 60, // 15 minutes in seconds
};

export const refreshTokenCookie = {
    name: 'rt',
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    path: '/api/auth/refresh', // Strict path constraint for security
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
};

export const googleStateCookie = {
    name: 'g_state',
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax', // Lax needed for OAuth redirect cross-site POST
    path: '/api/auth/google',
    maxAge: 10 * 60, // 10 minutes
};
