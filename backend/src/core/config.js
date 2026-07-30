const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Config = sequelize.define('Config', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        type: {
            type: DataTypes.ENUM('vless', 'reality', 'trojan', 'stormdns'),
            allowNull: false
        },
        server: {
            type: DataTypes.STRING,
            allowNull: false
        },
        port: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        uuid: {
            type: DataTypes.STRING,
            allowNull: false
        },
        path: {
            type: DataTypes.STRING,
            allowNull: true
        },
        flow: {
            type: DataTypes.STRING,
            allowNull: true
        },
        encryption: {
            type: DataTypes.STRING,
            allowNull: true
        },
        realityPublicKey: {
            type: DataTypes.STRING,
            allowNull: true
        },
        realityShortId: {
            type: DataTypes.STRING,
            allowNull: true
        },
        realityFingerprint: {
            type: DataTypes.STRING,
            allowNull: true
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        usedTraffic: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        totalTraffic: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false
        },
        link: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    });
    return Config;
};
