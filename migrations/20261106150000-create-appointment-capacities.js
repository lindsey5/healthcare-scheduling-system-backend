"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("appointment_capacities", {
            dayOfWeek: {
                type: Sequelize.ENUM(
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday"
                ),
                primaryKey: true,
                allowNull: false,
            },
            morningCapacity: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 10,
            },
            afternoonCapacity: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 10,
            },
        });

        await queryInterface.bulkInsert("appointment_capacities", [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
        ].map((dayOfWeek) => ({
            dayOfWeek,
            morningCapacity: 10,
            afternoonCapacity: 10,
        })));
    },

    async down(queryInterface) {
        await queryInterface.dropTable("appointment_capacities");
        await queryInterface.sequelize.query(
            'DROP TYPE IF EXISTS "enum_appointment_capacities_dayOfWeek";'
        );
    },
};
