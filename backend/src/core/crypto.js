const bcrypt = require('bcryptjs');
const crypto = require('crypto');

class Crypto {
    static async hash(text) {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(text, salt);
    }
    
    static async compare(text, hash) {
        return bcrypt.compare(text, hash);
    }
    
    static generateUUID() {
        return crypto.randomUUID();
    }
    
    static generateKey(length = 32) {
        return crypto.randomBytes(length).toString('base64');
    }
    
    static base64Encode(text) {
        return Buffer.from(text).toString('base64');
    }
    
    static base64Decode(text) {
        return Buffer.from(text, 'base64').toString('utf-8');
    }
}

module.exports = Crypto;
