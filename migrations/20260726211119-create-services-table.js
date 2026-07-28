"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("services", {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },

            serviceName: {
                type: Sequelize.STRING,
                allowNull: false,
            },

            dayOfWeek: {
                type: Sequelize.ENUM(
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
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

            duration: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 30,
                comment: "Duration in minutes",
            },

            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("services");

        // Required for MySQL to remove the ENUM type cleanly
        await queryInterface.sequelize
            .query("DROP TYPE IF EXISTS enum_services_dayOfWeek;")
            .catch(() => {});
    },
};