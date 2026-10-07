"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("doctor_schedules", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
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

            day: {
                type: Sequelize.ENUM(
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday"
                ),
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
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable("doctor_schedules");
    },
};