const express = require('express');
const router = express.Router();
const { User, Config, Log } = require('../database');
const { v4: uuidv4 } = require('uuid');
const Auth = require('../core/auth');
const crypto = require('../core/crypto');
const logger = require('../core/logger');

// Get all users
router.get('/', async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            include: [
                {
                    model: Config,
                    attributes: ['id', 'name', 'type', 'isActive']
                }
            ]
        });
        
        res.json(users);
    } catch (error) {
        logger.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Create user
router.post('/', async (req, res) => {
    try {
        const { username, password, email, role } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }
        
        const existing = await User.findOne({ where: { username } });
        if (existing) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        
        const hashedPassword = await Auth.hashPassword(password);
        const apiKey = crypto.generateKey(32);
        
        const user = await User.create({
            id: uuidv4(),
            username,
            password: hashedPassword,
            email,
            role: role || 'user',
            apiKey
        });
        
        logger.info(`User created: ${username}`);
        
        res.status(201).json({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            apiKey: user.apiKey
        });
    } catch (error) {
        logger.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// Get user details
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id, {
            attributes: { exclude: ['password'] },
            include: [
                {
                    model: Config,
                    attributes: ['id', 'name', 'type', 'isActive', 'usedTraffic', 'totalTraffic']
                },
                {
                    model: Log,
                    attributes: ['action', 'createdAt'],
                    limit: 10,
                    order: [['createdAt', 'DESC']]
                }
            ]
        });
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(user);
    } catch (error) {
        logger.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Update user
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        await user.update(req.body);
        logger.info(`User updated: ${id}`);
        
        res.json(user);
    } catch (error) {
        logger.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Delete user
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        await user.destroy();
        logger.info(`User deleted: ${id}`);
        
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        logger.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

module.exports = router;
