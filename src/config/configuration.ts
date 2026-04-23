export default () => ({
    port: parseInt(process.env.PORT || '3000', 10),
    db: {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432', 10),
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        name: process.env.DB_NAME,
    },
    jwtSecret: process.env.JWT_SECRET,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200',
    resendApiKey: process.env.RESEND_API_KEY,
    resendUseCustomDomain: process.env.RESEND_USE_CUSTOM_DOMAIN === 'true',
    resendFromEmail: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
});