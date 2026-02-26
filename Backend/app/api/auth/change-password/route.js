// f:\Uki\Final Project\Tamil Learning Platform\backend\app\api\auth\change-password\route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/Database/db';
import { authenticate } from '@/middleware/authenticate';
import { changePassword } from '@/controllers/authController';

export async function POST(request) {
    await connectDB();

    const { user, error: authError } = await authenticate(request);
    if (authError) return NextResponse.json({ error: authError }, { status: 401 });

    const { data, error, status: ctrlStatus } = await changePassword(request, user);
    if (error) return NextResponse.json({ error }, { status: ctrlStatus });

    return NextResponse.json({ ...data }, { status: ctrlStatus });
}
