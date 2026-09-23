import type { Options } from 'sequelize';

require('dotenv').config({ quiet: true });

const shared: Options = {
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  dialect: 'postgres',
  logging: false,
  timezone: '+00:00',
  dialectOptions: {
    useUTC: true,
  },
  define: {
    underscored: true,
    timestamps: true,
  },
};

const config = {
  development: {
    ...shared,
    database: process.env.DB_NAME || 'doctor_booking',
  },
  test: {
    ...shared,
    database: process.env.DB_NAME || 'doctor_booking_test',
  },
  production: {
    ...shared,
    database: process.env.DB_NAME,
  },
};

module.exports = config;
