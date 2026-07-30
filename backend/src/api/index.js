const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const configRoutes = require('./configs');
const userRoutes = require('./users');
const logRoutes = require('./logs');

// Health check
router.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Routes
router.use('/auth', authRoutes);
router.use('/configs', configRoutes);
router.use('/users', userRoutes);
router.use('/logs', logRoutes);

module.exports = router;
