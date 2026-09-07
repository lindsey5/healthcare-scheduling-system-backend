require('dotenv').config();

module.exports = {
    development: {
        url: process.env.DB_URI,
        dialect: 'postgres',
        dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
        },
        logging: false,
    },

    test: {
        url: process.env.DB_URI,
        dialect: 'postgres',
        dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
        },
        logging: false,
    },

    production: {
        url: process.env.DB_URI,
        dialect: 'postgres',
        dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
        },
        logging: false,
    },
};