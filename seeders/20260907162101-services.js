'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('services', [
      {
        serviceName: 'General Consultation',
        dayOfWeek: 'Monday',
        startTime: '08:00:00',
        endTime: '16:00:00',
      },
      {
        serviceName: 'TB DOTS Program',
        dayOfWeek: 'Thursday',
        startTime: '08:00:00',
        endTime: '16:00:00',
      },
      {
        serviceName: 'Pediatric Services (Children)',
        dayOfWeek: 'Tuesday',
        startTime: '08:00:00',
        endTime: '16:00:00',
      },
      {
        serviceName: 'Maternal Care / Prenatal Checkups',
        dayOfWeek: 'Tuesday',
        startTime: '08:00:00',
        endTime: '16:00:00',
      },
      {
        serviceName: 'Vaccination / Immunization',
        dayOfWeek: 'Monday',
        startTime: '08:00:00',
        endTime: '16:00:00',
      },
      {
        serviceName: 'Free Check-ups and Medicines',
        dayOfWeek: 'Monday',
        startTime: '08:00:00',
        endTime: '16:00:00',
      },
      {
        serviceName: 'Breastfeeding Room / Lactation Support',
        dayOfWeek: 'Monday',
        startTime: '08:00:00',
        endTime: '16:00:00',
      },
      {
        serviceName: 'OB-GYN Consultation',
        dayOfWeek: 'Wednesday',
        startTime: '08:00:00',
        endTime: '16:00:00',
      },
      {
        serviceName: 'Dental Services',
        dayOfWeek: 'Friday',
        startTime: '08:00:00',
        endTime: '15:00:00',
      },
      {
        serviceName: 'Minor Surgical Room',
        dayOfWeek: 'Thursday',
        startTime: '09:00:00',
        endTime: '14:00:00',
      },
    ]);
  },

  async down(queryInterface) {

  },
};
