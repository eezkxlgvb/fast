const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Log = sequelize.define('Log', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        action: {
            type: DataTypes.STRING,
            allowNull: false
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: true
        },
        ip: {
            type: DataTypes.STRING,
            allowNull: true
        },
        userAgent: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        details: {
            type: DataTypes.JSONB,
            allowNull: true
        },
        status: {
            type: DataTypes.STRING,
            allowNull: true
        }
    });
    return Log;
};
