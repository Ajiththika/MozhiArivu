// f:\Uki\Final Project\Tamil Learning Platform\backend\config\jwtConfig.js

export const jwtConfig = {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES || '30d',
    issuer: process.env.APP_NAME || 'TamilLearnPlatform'
};
