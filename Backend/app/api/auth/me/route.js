import { NextResponse } from 'next/server';
import { connectDB } from '../../../../config/db';
import User from '../../../../models/User';
import { authenticate } from '../../../../middleware/authenticate';

export async function GET(request) {
    try {
        await connectDB();

        // 1. Verify token
        const authResult = authenticate(request);
        if (authResult.error) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        // 2. Extract user ID (sub) and role from token
        const { sub, role } = authResult.user;

        // 3. Find user in the database
        const user = await User.findById(sub);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 4. Return user data (password is already excluded via select: false)
        return NextResponse.json({ user }, { status: 200 });

    } catch (error) {
        console.error("Me Route Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
