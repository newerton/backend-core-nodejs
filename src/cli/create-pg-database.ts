#!/usr/bin/env node
import * as dotenv from 'dotenv';
import { Client } from 'pg';

dotenv.config();

async function createDatabasesIfNotExists(databases) {
  const env = process.env.NODE_ENV || 'development';

  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;

  const hasAllEnvs = host && port && user && password;

  if (!hasAllEnvs) {
    throw new Error(
      'Missing database environment variables: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD',
    );
  }

  if (!env.startsWith('prod') && !env.startsWith('prd')) {
    const client = new Client({
      host,
      port,
      user,
      password,
      database: 'postgres',
    });

    try {
      await client.connect();

      for (const dbName of databases) {
        const dbExistsResult = await client.query(
          `SELECT EXISTS (SELECT 1 FROM pg_database WHERE datname = $1) AS "exists"`,
          [dbName],
        );

        const dbExists = dbExistsResult.rows[0].exists;

        if (!dbExists) {
          await client.query(`CREATE DATABASE "${dbName}"`);
          console.log(`✅ Database "${dbName}" created successfully.`);
        } else {
          console.log(`✔️ Database "${dbName}" already exists.`);
        }
      }
    } catch (error) {
      console.error('❌ Error while creating database:', error);
      throw error;
    } finally {
      // Desconecta do servidor PostgreSQL
      await client.end();
    }
  }
}

const args = process.argv.slice(2);
const databasesArg = args.find((arg) => arg.startsWith('--databases='));
if (!databasesArg) {
  console.error('❌ Missing required argument: --databases');
  process.exit(1);
}

const databases = databasesArg
  .split('=')[1]
  .split(',')
  .map((db) => db.trim());

for (const dbName of databases) {
  if (!dbName.match(/^[a-zA-Z0-9_]+$/)) {
    console.error(
      `❌ Invalid database name: "${dbName}". Only alphanumeric characters and underscores are allowed.`,
    );
    process.exit(1);
  }
}

createDatabasesIfNotExists(databases).catch((e) => {
  console.error('❌ Error during database creation:', e);
  process.exit(1);
});
