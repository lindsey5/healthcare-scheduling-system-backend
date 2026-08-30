"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("audits", {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },

            userId: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },

            userType: {
                type: Sequelize.ENUM(
                    "Admin",
                    "Staff"
                ),
                allowNull: false,
            },

            action: {
                type: Sequelize.STRING(50),
                allowNull: false,
            },

            entity: {
                type: Sequelize.STRING(100),
                allowNull: false,
            },

            entityId: {
                type: Sequelize.STRING(100),
                allowNull: false,
            },

            severity: {
                type: Sequelize.ENUM(
                    "INFO",
                    "WARNING",
                    "CRITICAL"
                ),
                allowNull: false,
            },

            oldValues: {
                type: Sequelize.JSON,
                allowNull: false,
            },

            newValues: {
                type: Sequelize.JSON,
                allowNull: false,
            },

            ipAddress: {
                type: Sequelize.STRING(45),
                allowNull: false,
            },

            userAgent: {
                type: Sequelize.TEXT,
                allowNull: false,
            },

            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal(
                    "CURRENT_TIMESTAMP"
                ),
            },

            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal(
                    "CURRENT_TIMESTAMP"
                ),
            },
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable("audits");
    },
};