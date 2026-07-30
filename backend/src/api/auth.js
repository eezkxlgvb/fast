const express = require('express');
const router = express.Router();
const Auth = require('../core/auth');
const { User } = require('../database');
const logger = require('../core/logger');

// Login
router.post('/login', async (req, res) => {
    try {
        const { password } = req.body;
        
        if (!password) {
            return res.status(400).json({ error: 'Password required' });
        }
        
        const token = await Auth.login(password);
        
        if (!token) {
            logger.warn(`Failed login attempt from ${req.ip}`);
            return res.status(401).json({ error: 'Invalid password' });
        }
        
        logger.info(`Successful login from ${req.ip}`);
        res.json({ token });
    } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Verify token
router.get('/verify', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ valid: false });
        }
        
        const decoded = Auth.verify(token);
        if (!decoded) {
            return res.status(401).json({ valid: false });
        }
        
        res.json({ valid: true });
    } catch (error) {
        res.status(500).json({ valid: false });
    }
});

module.exports = router;
