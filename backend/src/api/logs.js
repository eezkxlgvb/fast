const express = require('express');
const router = express.Router();
const { Log, User } = require('../database');
const logger = require('../core/logger');

// Get all logs
router.get('/', async (req, res) => {
    try {
        const logs = await Log.findAll({
            include: [
                {
                    model: User,
                    attributes: ['id', 'username']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: 100
        });
        
        res.json(logs);
    } catch (error) {
        logger.error('Error fetching logs:', error);
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
});

// Get logs by user
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const logs = await Log.findAll({
            where: { userId },
            include: [
                {
                    model: User,
                    attributes: ['id', 'username']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: 50
        });
        
        res.json(logs);
    } catch (error) {
        logger.error('Error fetching user logs:', error);
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
});

// Create log
router.post('/', async (req, res) => {
    try {
        const { action, userId, ip, userAgent, details, status } = req.body;
        
        const log = await Log.create({
            action,
            userId,
            ip,
            userAgent,
            details,
            status
        });
        
        res.status(201).json(log);
    } catch (error) {
        logger.error('Error creating log:', error);
        res.status(500).json({ error: 'Failed to create log' });
    }
});

// Delete logs older than
router.delete('/cleanup', async (req, res) => {
    try {
        const { days } = req.query;
        const limit = new Date();
        limit.setDate(limit.getDate() - (days || 30));
        
        const deleted = await Log.destroy({
            where: {
                createdAt: { [Op.lt]: limit }
            }
        });
        
        logger.info(`Cleaned up ${deleted} logs older than ${days || 30} days`);
        res.json({ deleted });
    } catch (error) {
        logger.error('Error cleaning logs:', error);
        res.status(500).json({ error: 'Failed to clean logs' });
    }
});

module.exports = router;
