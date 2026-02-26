// f:\Uki\Final Project\Tamil Learning Platform\backend\app\api\auth\verify-email\route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/Database/db';
import { verifyEmail } from '@/controllers/authController';

export async function POST(request) {
    await connectDB();

    const { data, error, status: ctrlStatus } = await verifyEmail(request);
    if (error) return NextResponse.json({ error }, { status: ctrlStatus });

    return NextResponse.json({ ...data }, { status: ctrlStatus });
}
