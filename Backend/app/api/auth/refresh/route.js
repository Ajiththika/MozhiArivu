// f:\Uki\Final Project\Tamil Learning Platform\backend\app\api\auth\refresh\route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/Database/db';
import { rateLimit } from '@/middleware/rateLimiter';
import { refresh } from '@/controllers/authController';
import { accessTokenCookie, refreshTokenCookie } from '@/config/cookieConfig';

export async function POST(request) {
    await connectDB();

    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
    const { limited, retryAfter } = await rateLimit(ip, 'refresh', 30, 900);
    if (limited) return NextResponse.json(
        { error: 'Too many requests.' },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );

    const { data, error, status: ctrlStatus } = await refresh(request);
    if (error) {
        const response = NextResponse.json({ error }, { status: ctrlStatus });
        response.cookies.delete(accessTokenCookie.name);
        response.cookies.delete(refreshTokenCookie.name);
        return response;
    }

    const response = NextResponse.json({ ...data }, { status: ctrlStatus });
    if (data.accessToken) response.cookies.set({ ...accessTokenCookie, value: data.accessToken });
    if (data.refreshToken) response.cookies.set({ ...refreshTokenCookie, value: data.refreshToken });
    return response;
}
