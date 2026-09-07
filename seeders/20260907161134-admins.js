'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    /*const salt = await bcrypt.genSalt();
    await queryInterface.bulkInsert('admins', [
      {
        firstname: 'System',
        lastname: 'Admin',
        email: 'admin@gmail.com',
        password: await bcrypt.hash('', salt),
      },
    ]);*/
  },

  async down(queryInterface) {

  },
};