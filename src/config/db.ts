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
  try {
    await sequelize.authenticate();
    console.log('Connected to the database.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

export { sequelize, connectDB };