"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("staff_notifications", {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },

            appointmentId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: "appointments",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },

            staffId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "staffs",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },

            message: {
                type: Sequelize.TEXT,
                allowNull: false,
            },

            isRead: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },

            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            },
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable("staff_notifications");
    },
};