"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("conversations", "recordingConsentAt", {
            type: Sequelize.DATE,
            allowNull: true,
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn(
            "conversations",
            "recordingConsentAt"
        );
    },
};
