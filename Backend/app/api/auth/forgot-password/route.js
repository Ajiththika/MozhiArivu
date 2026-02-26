// f:\Uki\Final Project\Tamil Learning Platform\backend\app\api\auth\forgot-password\route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/Database/db';
import { rateLimit } from '@/middleware/rateLimiter';
import { forgotPassword } from '@/controllers/authController';

export async function POST(request) {
    await connectDB();

    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
    const { limited, retryAfter } = await rateLimit(ip, 'forgot_password', 3, 3600); // 3 per 1 hour
    if (limited) return NextResponse.json(
        { error: 'Too many requests.' },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );

    const { data, error, status: ctrlStatus } = await forgotPassword(request, ip);
    if (error) return NextResponse.json({ error }, { status: ctrlStatus });

    return NextResponse.json({ ...data }, { status: ctrlStatus });
}
