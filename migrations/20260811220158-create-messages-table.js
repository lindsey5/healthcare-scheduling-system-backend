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

            patientId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: "patients",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },

            staffId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: "staffs",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
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

