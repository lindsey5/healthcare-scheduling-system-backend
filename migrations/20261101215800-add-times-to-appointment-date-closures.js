"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn(
            "appointment_date_closures",
            "startTime",
            {
                type: Sequelize.TIME,
                allowNull: true,
            }
        );

        await queryInterface.addColumn(
            "appointment_date_closures",
            "endTime",
            {
                type: Sequelize.TIME,
                allowNull: true,
            }
        );
    },

    async down(queryInterface) {
        await queryInterface.removeColumn("appointment_date_closures", "endTime");
        await queryInterface.removeColumn("appointment_date_closures", "startTime");
    },
};
