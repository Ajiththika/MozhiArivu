// f:\Uki\Final Project\Tamil Learning Platform\backend\app\api\auth\logout\route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/Database/db';
import { authenticate } from '@/middleware/authenticate';
import { logout } from '@/controllers/authController';
import { accessTokenCookie, refreshTokenCookie } from '@/config/cookieConfig';

export async function POST(request) {
    await connectDB();

    const { user, error: authError } = await authenticate(request);
    if (authError) return NextResponse.json({ error: authError }, { status: 401 });

    const { data, error, status: ctrlStatus } = await logout(request, user);
    if (error) return NextResponse.json({ error }, { status: ctrlStatus });

    const response = NextResponse.json({ ...data }, { status: ctrlStatus });
    response.cookies.delete(accessTokenCookie.name);
    response.cookies.delete(refreshTokenCookie.name);

    return response;
}
