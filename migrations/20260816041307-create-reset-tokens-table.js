'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('reset_tokens', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },

            resetToken: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },

            patientId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'patients',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },

            expiresAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('reset_tokens');
    },
};