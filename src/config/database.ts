import { Sequelize } from 'sequelize';
import env from './env';

export const sequelize = new Sequelize(env.db.name, env.db.user, env.db.password, {
  host: env.db.host,
  port: env.db.port,
  dialect: 'postgres',
  logging: env.isTest || env.isProduction ? false : console.log,
  timezone: '+00:00',
  dialectOptions: {
    useUTC: true,
  },
  define: {
    underscored: true,
    timestamps: true,
  },
});
