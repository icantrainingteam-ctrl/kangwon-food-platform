import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// 항상 개별 파라미터 방식 사용 (비밀번호 특수문자 안전)
// 환경에 따라 SSL 설정 (로컬은 false, Vercel/Supabase는 require)
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/kangwon_food';
const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

const client = postgres(connectionString, { ssl: isLocal ? false : 'require' });
export const db = drizzle(client, { schema });
export type Database = typeof db;
