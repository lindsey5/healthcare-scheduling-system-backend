"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("doctor_services", "startTime", {
            type: Sequelize.TIME,
            allowNull: true,
        });
        await queryInterface.addColumn("doctor_services", "endTime", {
            type: Sequelize.TIME,
            allowNull: true,
        });

        await queryInterface.sequelize.query(`
            UPDATE "doctor_services" AS ds
            SET "startTime" = s."startTime",
                "endTime" = s."endTime"
            FROM "services" AS s
            WHERE ds."serviceId" = s."id"
        `);

        await queryInterface.changeColumn("doctor_services", "startTime", {
            type: Sequelize.TIME,
            allowNull: false,
        });
        await queryInterface.changeColumn("doctor_services", "endTime", {
            type: Sequelize.TIME,
            allowNull: false,
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn("doctor_services", "endTime");
        await queryInterface.removeColumn("doctor_services", "startTime");
    },
};
