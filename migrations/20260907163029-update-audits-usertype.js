"use strict";

module.exports = {
    async up(queryInterface) {
        await queryInterface.sequelize.transaction(async (transaction) => {
            // 1. Convert ENUM column to text
            await queryInterface.sequelize.query(`
                ALTER TABLE "audits"
                ALTER COLUMN "userType" TYPE VARCHAR(20)
                USING "userType"::text
            `, { transaction });

            // 2. Remove old ENUM
            await queryInterface.sequelize.query(`
                DROP TYPE IF EXISTS "enum_audits_userType"
            `, { transaction });

            // 3. Create new lowercase ENUM
            await queryInterface.sequelize.query(`
                CREATE TYPE "enum_audits_userType"
                AS ENUM ('admin', 'staff')
            `, { transaction });

            // 4. Convert column back to ENUM
            await queryInterface.sequelize.query(`
                ALTER TABLE "audits"
                ALTER COLUMN "userType"
                TYPE "enum_audits_userType"
                USING LOWER("userType")::"enum_audits_userType"
            `, { transaction });
        });
    },

    async down(queryInterface) {
        await queryInterface.sequelize.transaction(async (transaction) => {
            // Convert ENUM to text
            await queryInterface.sequelize.query(`
                ALTER TABLE "audits"
                ALTER COLUMN "userType" TYPE VARCHAR(20)
                USING "userType"::text
            `, { transaction });

            // Remove lowercase ENUM
            await queryInterface.sequelize.query(`
                DROP TYPE IF EXISTS "enum_audits_userType"
            `, { transaction });

            // Create original ENUM
            await queryInterface.sequelize.query(`
                CREATE TYPE "enum_audits_userType"
                AS ENUM ('Admin', 'Staff')
            `, { transaction });

            // Convert back
            await queryInterface.sequelize.query(`
                ALTER TABLE "audits"
                ALTER COLUMN "userType"
                TYPE "enum_audits_userType"
                USING INITCAP("userType")::"enum_audits_userType"
            `, { transaction });
        });
    },
};