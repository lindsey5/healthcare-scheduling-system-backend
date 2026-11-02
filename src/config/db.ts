import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_URI || '',
  {
    dialect: 'postgres',
    logging: false,
  }
);

// Function to test database connection
const connectDB = async () => {
  await sequelize.authenticate();
  console.log('Connected to the database.');
};

export { sequelize, connectDB };