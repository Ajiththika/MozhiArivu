// f:\Uki\Final Project\Tamil Learning Platform\backend\app\api\auth\google\callback\route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/Database/db';
import { googleCallback } from '@/controllers/authController';
import { accessTokenCookie, refreshTokenCookie, googleStateCookie } from '@/config/cookieConfig';

export async function GET(request) {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const savedState = request.cookies.get('g_state')?.value;
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';

    if (!code || !state || !savedState) {
        return NextResponse.json({ error: 'OAuth missing params or state' }, { status: 400 });
    }

    const { data, error, status: ctrlStatus } = await googleCallback(request, code, state, savedState, ip);

    const responseOptions = { status: ctrlStatus };
    const response = error
        ? NextResponse.json({ error }, responseOptions)
        : NextResponse.json({ ...data }, responseOptions);

    response.cookies.delete(googleStateCookie.name);

    if (!error) {
        if (data.accessToken) response.cookies.set({ ...accessTokenCookie, value: data.accessToken });
        if (data.refreshToken) response.cookies.set({ ...refreshTokenCookie, value: data.refreshToken });
    }

    return response;
}
