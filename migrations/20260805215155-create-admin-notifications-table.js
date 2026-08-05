'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('admin_notifications', {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },

            appointmentId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'appointments',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },

            adminId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'admins',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },

            message: {
                type: Sequelize.TEXT,
                allowNull: false,
            },

            isRead: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },

            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('admin_notifications');
    },
};