"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("messages", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },

            conversationId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "conversations",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },

            senderId: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },

            senderType: {
                type: Sequelize.ENUM("Patient", "Staff"),
                allowNull: false,
            },

            message: {
                type: Sequelize.TEXT,
                allowNull: false,
            },

            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable("messages");
    },
};