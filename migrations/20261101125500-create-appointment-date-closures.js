"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("appointment_date_closures", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            closureDate: {
                type: Sequelize.DATEONLY,
                allowNull: false,
                unique: true,
            },
            reason: {
                type: Sequelize.STRING(255),
                allowNull: true,
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            },
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable("appointment_date_closures");
    },
};
