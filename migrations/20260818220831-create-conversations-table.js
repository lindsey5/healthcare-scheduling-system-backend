"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("conversations", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },

            patientId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "patients",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },

            assignedStaffId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: "staffs",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },

            status: {
                type: Sequelize.ENUM("Waiting", "Active", "Closed"),
                allowNull: false,
                defaultValue: "Waiting",
            },

            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },

            acceptedAt: {
                type: Sequelize.DATE,
                allowNull: true,
            },

            closedAt: {
                type: Sequelize.DATE,
                allowNull: true,
            },
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable("conversations");
    },
};