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
        userId: {  // ← اینجا رو اصلاح کن
            type: DataTypes.UUID,
            allowNull: true
        },
        ip: {
            type: DataTypes.STRING,
            allowNull: true
        },
        userAgent: {  // ← این رو هم اضافه کن (اختیاری)
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
    }, {
        timestamps: true,  // ← createdAt و updatedAt خودکار
        paranoid: false
    });

    return Log;
};
