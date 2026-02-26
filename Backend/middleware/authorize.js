// f:\Uki\Final Project\Tamil Learning Platform\backend\middleware\authorize.js
export function authorize(...allowedRoles) {
    return function checkRole(user) {
        if (!allowedRoles.includes(user.role)) {
            return { error: 'Access denied. Insufficient permissions.', status: 403 };
        }
        return { ok: true };
    };
}
