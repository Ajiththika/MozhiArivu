// f:\Uki\Final Project\Tamil Learning Platform\backend\app\api\auth\login\route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/Database/db';
import { rateLimit } from '@/middleware/rateLimiter';
import { login } from '@/controllers/authController';
import { accessTokenCookie, refreshTokenCookie } from '@/config/cookieConfig';

export async function POST(request) {
    await connectDB();

    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
    const { limited, retryAfter } = await rateLimit(ip, 'login', 5, 900);
    if (limited) return NextResponse.json(
        { error: 'Too many requests.' },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );

    const { data, error, status: ctrlStatus, headers } = await login(request, ip);

    const resOptions = { status: ctrlStatus };
    if (headers) {
        resOptions.headers = headers;
    }

    if (error) return NextResponse.json({ error }, resOptions);

    const response = NextResponse.json({ ...data }, resOptions);
    if (data.accessToken) response.cookies.set({ ...accessTokenCookie, value: data.accessToken });
    if (data.refreshToken) response.cookies.set({ ...refreshTokenCookie, value: data.refreshToken });
    return response;
}
