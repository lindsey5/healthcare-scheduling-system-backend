"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("doctor_offered_services", {
            doctorId: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                allowNull: false,
                references: {
                    model: "doctors",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            serviceId: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                allowNull: false,
                references: {
                    model: "services",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
        });

        await queryInterface.sequelize.query(`
            INSERT INTO "doctor_offered_services" ("doctorId", "serviceId")
            SELECT DISTINCT "doctorId", "serviceId"
            FROM "doctor_services"
        `);
    },

    async down(queryInterface) {
        await queryInterface.dropTable("doctor_offered_services");
    },
};
