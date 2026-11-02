"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("email_jobs", {
            id: {
                type: Sequelize.BIGINT,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            type: {
                type: Sequelize.STRING(40),
                allowNull: false,
            },
            payload: {
                type: Sequelize.JSONB,
                allowNull: true,
            },
            status: {
                type: Sequelize.ENUM(
                    "queued",
                    "processing",
                    "sent",
                    "failed"
                ),
                allowNull: false,
                defaultValue: "queued",
            },
            attempts: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            availableAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
            lockedAt: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            lastError: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
        });

        await queryInterface.addIndex("email_jobs", ["status", "availableAt"]);
        await queryInterface.addIndex("email_jobs", ["status", "lockedAt"]);
    },

    async down(queryInterface) {
        await queryInterface.dropTable("email_jobs");

        if (queryInterface.sequelize.getDialect() === "postgres") {
            await queryInterface.sequelize.query(
                'DROP TYPE IF EXISTS "enum_email_jobs_status";'
            );
        }
    },
};
