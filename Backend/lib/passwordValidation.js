// f:\Uki\Final Project\Tamil Learning Platform\backend\lib\passwordValidation.js

export function validatePassword(password) {
    const errors = [];

    if (!password) {
        return { isValid: false, errors: ['Password is required'] };
    }

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }

    if (password.length > 64) {
        errors.push('Password must not exceed 64 characters');
    }

    // Needs at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    // Needs at least one lowercase letter
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    // Needs at least one number
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    // Needs at least one special character
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}
