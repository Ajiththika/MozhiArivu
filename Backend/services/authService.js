import User from '../models/User';
import { hashPassword, comparePassword } from '../lib/hash';
import { generateToken } from '../lib/jwt';

export const registerService = async ({ email, password, role = 'user' }) => {
    // Basic validation
    if (!email || !password) {
        return { error: 'Email and password are required', status: 400 };
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
        return { error: 'Invalid email format', status: 400 };
    }

    if (password.length < 8) {
        return { error: 'Password must be at least 8 characters long', status: 400 };
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return { error: 'Email is already registered', status: 400 };
    }

    // Hash password and save new user
    const hashedPassword = await hashPassword(password);

    // Default to 'user', unless overriding (Note: you might want to restrict role setting in prod)
    const validRoles = ['user', 'admin', 'superadmin'];
    const finalRole = validRoles.includes(role) ? role : 'user';

    const newUser = await User.create({
        email,
        password: hashedPassword,
        role: finalRole,
    });

    // Remove password from response
    const userSafe = newUser.toObject();
    delete userSafe.password;

    return { data: { message: 'Registration successful', user: userSafe }, status: 201 };
};

export const loginService = async ({ email, password }) => {
    if (!email || !password) {
        return { error: 'Email and password are required', status: 400 };
    }

    // Include the password explicitly because it has select: false in the model
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        return { error: 'Invalid email or password', status: 401 };
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
        return { error: 'Invalid email or password', status: 401 };
    }

    // Generate JWT Access Token (15 mins)
    const token = generateToken({
        sub: user._id.toString(),
        role: user.role
    });

    // Remove password from response
    const userSafe = user.toObject();
    delete userSafe.password;

    return { data: { token, user: userSafe }, status: 200 };
};
