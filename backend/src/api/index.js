const { Sequelize, DataTypes } = require('sequelize');
const config = require('../core/config');
const logger = require('../core/logger');
const path = require('path');

// اگر DATABASE_URL وجود نداشت، از SQLite استفاده کن
let sequelize;
if (config.dbUrl && config.dbUrl.startsWith('postgres')) {
    sequelize = new Sequelize(config.dbUrl, {
        dialect: 'postgres',
        logging: (msg) => logger.debug(msg),
        pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
    });
} else {
    // استفاده از SQLite پیش‌فرض
    const sqlitePath = path.join(__dirname, '../../../grootz.sqlite');
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: sqlitePath,
        logging: (msg) => logger.debug(msg)
    });
    logger.info(`📁 Using SQLite database at ${sqlitePath}`);
}

// تعریف مدل‌ها (همان کد قبلی)
const User = require('./models/User')(sequelize);
const Config = require('./models/Config')(sequelize);
const Log = require('./models/Log')(sequelize);

// روابط
User.hasMany(Config, { foreignKey: 'userId' });
Config.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Log, { foreignKey: 'userId' });
Log.belongsTo(User, { foreignKey: 'userId' });

const initDb = async () => {
    try {
        await sequelize.authenticate();
        logger.info('✅ Database connected');
        await sequelize.sync({ alter: true });
        logger.info('✅ Database synced');
    } catch (error) {
        logger.error('❌ Database error:', error);
        throw error;
    }
};

module.exports = {
    sequelize,
    User,
    Config,
    Log,
    initDb
};
