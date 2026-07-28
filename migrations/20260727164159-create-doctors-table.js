"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("doctors", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },

      firstname: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      lastname: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      status: {
        type: Sequelize.ENUM("Active", "Inactive"),
        allowNull: false,
        defaultValue: "Active",
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("doctors");

    // Remove the ENUM type (PostgreSQL only)
    if (queryInterface.sequelize.getDialect() === "postgres") {
      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_doctors_status";'
      );
    }
  },
};