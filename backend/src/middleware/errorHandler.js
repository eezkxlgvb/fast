const logger = require('../core/logger');

const errorHandler = (err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || 'Internal server error';
    
    logger.error(`${status} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    
    res.status(status).json({
        error: message,
        timestamp: new Date().toISOString()
    });
};

module.exports = errorHandler;
