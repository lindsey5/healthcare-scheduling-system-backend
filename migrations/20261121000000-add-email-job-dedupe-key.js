"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("email_jobs", "dedupeKey", {
            type: Sequelize.STRING(160),
            allowNull: true,
            unique: true,
        });
    },
    async down(queryInterface) {
        await queryInterface.removeColumn("email_jobs", "dedupeKey");
    },
};
