// f:\Uki\Final Project\Tamil Learning Platform\backend\app\api\auth\google\route.js
import { NextResponse } from 'next/server';
import { rateLimit } from '@/middleware/rateLimiter';
import { googleInitiate } from '@/controllers/authController';
import { googleStateCookie } from '@/config/cookieConfig';
import { connectDB } from '@/Database/db';

export async function GET(request) {
    await connectDB();

    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
    const { limited, retryAfter } = await rateLimit(ip, 'google_initiate', 10, 3600); // 10 per hour per IP
    if (limited) return NextResponse.json(
        { error: 'Too many requests.' },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );

    const { data, error, status: ctrlStatus } = await googleInitiate();
    if (error) return NextResponse.json({ error }, { status: ctrlStatus });

    const response = NextResponse.redirect(data.url, 302);
    response.cookies.set({ ...googleStateCookie, value: data.state });
    return response;
}
