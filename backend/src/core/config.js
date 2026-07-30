
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    port: process.env.PORT || 3000,
    jwtSecret: process.env.JWT_SECRET || 'reza_grootz_secret',
    adminPassword: process.env.ADMIN_PASSWORD || 'reza grootz',
    dbUrl: process.env.DATABASE_URL || 'sqlite://grootz.sqlite', // این خط رو اضافه کن
    env: process.env.NODE_ENV || 'development'
};
