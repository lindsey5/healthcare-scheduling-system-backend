"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("appointment_reschedules", {
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

            oldDoctorId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: "doctors",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },

            newDoctorId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: "doctors",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },

            oldAppointmentDate: {
                type: Sequelize.DATEONLY,
                allowNull: false,
            },

            newAppointmentDate: {
                type: Sequelize.DATEONLY,
                allowNull: false,
            },

            oldAppointmentTime: {
                type: Sequelize.TIME,
                allowNull: false,
            },

            newAppointmentTime: {
                type: Sequelize.TIME,
                allowNull: false,
            },

            reason: {
                type: Sequelize.TEXT,
                allowNull: false,
            },

            rescheduledByType: {
                type: Sequelize.ENUM("Admin", "Staff"),
                allowNull: false,
            },

            rescheduledByAdminId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: "admins",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },

            rescheduledByStaffId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: "staffs",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },

            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable("appointment_reschedules");
    },
};