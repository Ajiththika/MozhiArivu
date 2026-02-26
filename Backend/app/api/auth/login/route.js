import { NextResponse } from 'next/server';
import { connectDB } from '../../../../config/db';
import { loginService } from '../../../../services/authService';

export async function POST(request) {
    try {
        await connectDB();

        const body = await request.json();

        // Pass data to service
        const { data, error, status } = await loginService(body);

        if (error) {
            return NextResponse.json({ error }, { status: status || 401 });
        }

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("Login Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
