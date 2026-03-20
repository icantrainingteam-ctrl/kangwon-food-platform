import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// 항상 개별 파라미터 방식 사용 (비밀번호 특수문자 안전)
const client = postgres({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  database: process.env.DB_NAME ?? 'postgres',
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  ssl: process.env.DB_HOST ? { rejectUnauthorized: false } : false,
  max: 5,
  idle_timeout: 20,
  connect_timeout: 30,
});

export const db = drizzle(client, { schema });
export type Database = typeof db;
