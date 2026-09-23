import { createApp } from './app';
import env from './config/env';
import { sequelize } from './config/database';

async function start(): Promise<void> {
  await sequelize.authenticate();
  const app = createApp();
  app.listen(env.port, () => {
    console.log(`Doctor booking API listening on port ${env.port}`);
  });
}

start().catch((error: unknown) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
