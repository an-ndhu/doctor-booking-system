import { Client } from 'pg';
import { execSync } from 'child_process';
import path from 'path';
import { sequelize } from '../src/config/database';
import '../src/database/models';

function runCli(args: string): void {
  execSync(`npx sequelize-cli ${args}`, {
    cwd: path.resolve(__dirname, '..'),
    env: process.env,
    stdio: 'pipe',
  });
}

async function ensureTestDatabase(): Promise<void> {
  const client = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres',
  });
  await client.connect();
  const dbName = process.env.DB_NAME;
  if (!dbName) {
    throw new Error('DB_NAME is required for tests');
  }
  const existing = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
  if (existing.rowCount === 0) {
    await client.query(`CREATE DATABASE "${dbName}"`);
  }
  await client.end();
}

beforeAll(async () => {
  await ensureTestDatabase();
  runCli('db:migrate');
  await sequelize.authenticate();
});

afterAll(async () => {
  await sequelize.close();
});
