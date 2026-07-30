const express = require('express');
const router = express.Router();
const { Config, User } = require('../database');
const { v4: uuidv4 } = require('uuid');
const crypto = require('../core/crypto');
const logger = require('../core/logger');

const VLESSGenerator = require('../generator/vless');
const RealityGenerator = require('../generator/reality');
const TrojanGenerator = require('../generator/trojan');
const StormDNSGenerator = require('../generator/stormdns');

// Get all configs
router.get('/', async (req, res) => {
    try {
        const configs = await Config.findAll({
            include: [
                {
                    model: User,
                    attributes: ['id', 'username']
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        
        res.json(configs);
    } catch (error) {
        logger.error('Error fetching configs:', error);
        res.status(500).json({ error: 'Failed to fetch configs' });
    }
});

// Create config
router.post('/', async (req, res) => {
    try {
        const { type, name, server, port, userId, ...rest } = req.body;
        
        if (!type || !name || !server || !port || !userId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Generate config
        let generated;
        const baseData = { name, server, port, ...rest };
        
        switch(type) {
            case 'vless':
                generated = VLESSGenerator.generate(baseData);
                break;
            case 'reality':
                generated = RealityGenerator.generate(baseData);
                break;
            case 'trojan':
                generated = TrojanGenerator.generate(baseData);
                break;
            case 'stormdns':
                generated = StormDNSGenerator.generate(baseData);
                break;
            default:
                return res.status(400).json({ error: 'Invalid config type' });
        }
        
        const configData = {
            id: uuidv4(),
            name,
            type,
            server,
            port,
            uuid: generated.config.uuid || crypto.generateUUID(),
            path: generated.config.path || '/',
            flow: generated.config.flow || 'xtls-rprx-vision',
            encryption: generated.config.encryption || 'none',
            realityPublicKey: generated.config.publicKey || null,
            realityShortId: generated.config.shortId || null,
            realityFingerprint: generated.config.fingerprint || 'chrome',
            isActive: true,
            userId,
            link: generated.link,
            usedTraffic: 0,
            totalTraffic: 0,
            expiresAt: rest.expiresAt || null
        };
        
        const config = await Config.create(configData);
        
        logger.info(`Config created: ${name} (${type}) for user ${userId}`);
        
        res.status(201).json({
            config,
            link: generated.link,
            base64Link: generated.base64Link,
            json: generated.json
        });
    } catch (error) {
        logger.error('Error creating config:', error);
        res.status(500).json({ error: 'Failed to create config' });
    }
});

// Update config
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const config = await Config.findByPk(id);
        
        if (!config) {
            return res.status(404).json({ error: 'Config not found' });
        }
        
        await config.update(req.body);
        logger.info(`Config updated: ${id}`);
        
        res.json(config);
    } catch (error) {
        logger.error('Error updating config:', error);
        res.status(500).json({ error: 'Failed to update config' });
    }
});

// Delete config
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const config = await Config.findByPk(id);
        
        if (!config) {
            return res.status(404).json({ error: 'Config not found' });
        }
        
        await config.destroy();
        logger.info(`Config deleted: ${id}`);
        
        res.json({ message: 'Config deleted successfully' });
    } catch (error) {
        logger.error('Error deleting config:', error);
        res.status(500).json({ error: 'Failed to delete config' });
    }
});

module.exports = router;
