"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("appointments", {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
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

            serviceId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "services",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },

            doctorId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "doctors",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },

            appointmentDate: {
                type: Sequelize.DATEONLY,
                allowNull: false,
            },

            startTime: {
                type: Sequelize.TIME,
                allowNull: false,
            },

            endTime: {
                type: Sequelize.TIME,
                allowNull: false,
            },

            status: {
                type: Sequelize.ENUM(
                    "Pending",
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
                type: Sequelize.STRING,
                allowNull: false,
            },

            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("appointments");

        // Required for PostgreSQL; harmless if ignored on MySQL
        await queryInterface.sequelize
            .query("DROP TYPE IF EXISTS enum_appointments_status;")
            .catch(() => {});
    },
};