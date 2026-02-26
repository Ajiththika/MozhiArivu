// f:\Uki\Final Project\Tamil Learning Platform\backend\middleware\rateLimiter.js
import AuditLog from '@/models/auditLogModel';

export async function rateLimit(ip, action, maxAttempts, windowSeconds) {
    const windowStart = new Date(Date.now() - windowSeconds * 1000);

    const count = await AuditLog.countDocuments({
        ip,
        action: { $in: [action, `${action}_FAILED`] },
        createdAt: { $gte: windowStart }
    });

    if (count >= maxAttempts) {
        return { limited: true, retryAfter: windowSeconds };
    }
    return { limited: false };
}
