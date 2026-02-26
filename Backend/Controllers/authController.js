// f:\Uki\Final Project\Tamil Learning Platform\backend\controllers\authController.js
import { z } from 'zod';
import { validatePassword } from '@/lib/passwordValidation';
import { authService } from '@/services/authService';
import { googleService } from '@/services/googleService';
import { tokenService } from '@/services/tokenService';
import { getGoogleOAuthURL } from '@/config/googleConfig';
import crypto from 'crypto';

const registerSchema = z.object({
    email: z.string().email().toLowerCase().trim(),
    password: z.string().refine((val) => validatePassword(val).isValid, {
        message: 'Password does not meet required criteria',
    }),
    confirmPassword: z.string(),
    role: z.enum(['USER_STUDENT', 'USER_PARENT']),
    teacherCode: z.string().trim().min(1).optional(),
    studentEmail: z.string().email().optional()
}).strict().refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
});

const loginSchema = z.object({
    email: z.string().email().toLowerCase().trim(),
    password: z.string().min(1, "Password cannot be empty").max(128)
}).strict();

export async function register(request, ip) {
    try {
        const body = await request.json();
        const parsed = registerSchema.safeParse(body);
        if (!parsed.success) {
            return { error: parsed.error.errors[0].message, status: 400 };
        }

        const userAgent = request.headers.get('user-agent') || 'unknown';
        const data = await authService.register(parsed.data, ip, userAgent);

        return { data, status: 201 };
    } catch (error) {
        return { error: error.message, status: 400 };
    }
}

export async function login(request, ip) {
    try {
        const body = await request.json();
        const parsed = loginSchema.safeParse(body);
        if (!parsed.success) {
            return { error: 'Invalid email or password', status: 400 };
        }

        const userAgent = request.headers.get('user-agent') || 'unknown';
        const data = await authService.login(parsed.data.email, parsed.data.password, ip, userAgent);

        return { data, status: 200 };
    } catch (error) {
        if (error.status === 423) {
            return { error: error.message, status: 423, headers: { 'Retry-After': String(error.retryAfter) } };
        }
        return { error: error.message, status: 400 };
    }
}

export async function logout(request, currentUser) {
    try {
        await authService.logout(currentUser.id, currentUser.sessionId);
        return { data: { message: 'Logged out successfully' }, status: 200 };
    } catch (error) {
        return { error: 'Logout failed', status: 500 };
    }
}

export async function refresh(request) {
    try {
        const rt = request.cookies.get('rt')?.value;
        if (!rt) {
            return { error: 'No refresh token provided', status: 401 };
        }

        const data = await authService.refreshTokens(rt);
        return { data, status: 200 };
    } catch (error) {
        return { error: error.message || 'Invalid refresh token', status: 401 };
    }
}

export async function me(request, currentUser) {
    return { data: { user: currentUser }, status: 200 };
}

export async function googleInitiate() {
    const state = crypto.randomUUID();
    const url = getGoogleOAuthURL(state);
    return { data: { url, state }, status: 200 };
}

export async function googleCallback(request, code, state, savedState, ip) {
    try {
        if (state !== savedState) {
            throw new Error('invalid_state');
        }

        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                code,
                grant_type: 'authorization_code',
                redirect_uri: process.env.GOOGLE_CALLBACK_URL,
            })
        });

        if (!tokenResponse.ok) {
            throw new Error('Failed to exchange code');
        }

        const tokens = await tokenResponse.json();

        const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokens.access_token}` }
        });

        if (!profileResponse.ok) {
            throw new Error('Failed to fetch profile');
        }

        const profile = await profileResponse.json();
        const userAgent = request.headers.get('user-agent') || 'unknown';

        const user = await googleService.findOrCreateGoogleUser(profile, ip, userAgent);
        const sessionData = await authService.createSession(user._id, ip, userAgent);

        const accessToken = tokenService.signAccessToken({
            userId: user._id,
            email: user.email,
            role: user.role,
            sessionId: sessionData.session._id
        });

        const refreshToken = tokenService.signRefreshToken({
            userId: user._id,
            sessionId: sessionData.session._id
        });

        return { data: { accessToken, refreshToken, user: user.toSafeObject() }, status: 200 };
    } catch (error) {
        return { error: error.message, status: 400 };
    }
}

export async function verifyEmail(request) {
    return { data: { message: 'Not implemented' }, status: 501 };
}

export async function forgotPassword(request, ip) {
    // Always return success to prevent enumeration
    return { data: { message: 'If that email exists, a reset link was sent' }, status: 200 };
}

export async function resetPassword(request) {
    return { data: { message: 'Not implemented' }, status: 501 };
}

export async function changePassword(request, currentUser) {
    return { data: { message: 'Not implemented' }, status: 501 };
}
