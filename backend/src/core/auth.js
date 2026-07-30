const jwt = require('jsonwebtoken');
const config = require('./config');
const crypto = require('./crypto');

class Auth {
    static async login(password) {
        const isValid = password === config.adminPassword;
        if (!isValid) return null;
        
        const token = jwt.sign(
            { 
                role: 'admin', 
                expiresIn: '7d',
                timestamp: Date.now()
            },
            config.jwtSecret,
            { expiresIn: '7d' }
        );
        
        return token;
    }
    
    static verify(token) {
        try {
            const decoded = jwt.verify(token, config.jwtSecret);
            return decoded;
        } catch (error) {
            return null;
        }
    }
    
    static async hashPassword(plain) {
        return crypto.hash(plain);
    }
    
    static async comparePassword(plain, hashed) {
        return crypto.compare(plain, hashed);
    }
}

module.exports = Auth;
