"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("appointments", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },

            patientId: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },

            serviceId: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },

            doctorId: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },

            appointmentDate: {
                type: Sequelize.DATEONLY,
                allowNull: false,
            },

            appointmentTime: {
                type: Sequelize.TIME,
                allowNull: false,
            },

            status: {
                type: Sequelize.ENUM(
                    "Pending",
                    "Approved",
                    "Checked In",
                    "Completed",
                    "Cancelled",
                    "No Show",
                    "Rescheduled"
                ),
                allowNull: false,
                defaultValue: "Pending",
            },

            purposeOfVisit: {
                type: Sequelize.TEXT,
                allowNull: true,
            },

            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable("appointments");
    },
};