import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// 개별 파라미터 방식 (비밀번호 특수문자 안전)
const client = process.env.DB_HOST
  ? postgres({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT ?? 6543),
      database: process.env.DB_NAME ?? 'postgres',
      username: process.env.DB_USER ?? 'postgres',
      password: process.env.DB_PASSWORD ?? '',
      ssl: { rejectUnauthorized: false },
      max: 5,
      idle_timeout: 20,
      connect_timeout: 30,
    })
  : postgres(process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/postgres', {
      max: 5,
      idle_timeout: 20,
      connect_timeout: 30,
    });

export const db = drizzle(client, { schema });
export type Database = typeof db;
