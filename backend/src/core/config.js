const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    port: process.env.PORT || 3000,
    jwtSecret: process.env.JWT_SECRET || 'reza_grootz_secret',
    adminPassword: process.env.ADMIN_PASSWORD || 'reza grootz',
    dbUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/grootz_db',
    env: process.env.NODE_ENV || 'development'
};
