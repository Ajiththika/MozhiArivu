// f:\Uki\Final Project\Tamil Learning Platform\backend\app\api\auth\reset-password\route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/Database/db';
import { resetPassword } from '@/controllers/authController';

export async function POST(request) {
    await connectDB();

    const { data, error, status: ctrlStatus } = await resetPassword(request);
    if (error) return NextResponse.json({ error }, { status: ctrlStatus });

    return NextResponse.json({ ...data }, { status: ctrlStatus });
}
