"use strict";

/** @type {import("sequelize-cli").Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("appointment_records", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
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

            firstName: {
                type: Sequelize.STRING,
                allowNull: false,
            },

            middleName: {
                type: Sequelize.STRING,
                allowNull: true,
            },

            lastName: {
                type: Sequelize.STRING,
                allowNull: false,
            },

            suffix: {
                type: Sequelize.STRING,
                allowNull: true,
            },

            birthDate: {
                type: Sequelize.DATEONLY,
                allowNull: false,
            },

            gender: {
                type: Sequelize.ENUM("Male", "Female"),
                allowNull: false,
            },

            civilStatus: {
                type: Sequelize.ENUM(
                    "Single",
                    "Married",
                    "Widowed",
                    "Separated"
                ),
                allowNull: false,
            },

            contactNumber: {
                type: Sequelize.STRING,
                allowNull: false,
            },

            email: {
                type: Sequelize.STRING,
                allowNull: true,
            },

            completeAddress: {
                type: Sequelize.TEXT,
                allowNull: false,
            },

            emergencyContactPerson: {
                type: Sequelize.STRING,
                allowNull: true,
            },

            emergencyContactNumber: {
                type: Sequelize.STRING,
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
    },

    async down(queryInterface) {
        await queryInterface.dropTable("appointment_records");

        if (queryInterface.sequelize.getDialect() === "postgres") {
            await queryInterface.sequelize.query(
                'DROP TYPE IF EXISTS "enum_appointment_records_gender";'
            );

            await queryInterface.sequelize.query(
                'DROP TYPE IF EXISTS "enum_appointment_records_civilStatus";'
            );
        }
    },
};