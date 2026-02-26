import { NextResponse } from 'next/server';
import { connectDB } from '../../../../config/db';
import { registerService } from '../../../../services/authService';

export async function POST(request) {
    try {
        await connectDB();

        const body = await request.json();

        // Pass data to service
        const { data, error, status } = await registerService(body);

        if (error) {
            return NextResponse.json({ error }, { status: status || 400 });
        }

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error("Register Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
