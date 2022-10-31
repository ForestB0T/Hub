import 'dotenv/config'
import { PoolConfig } from 'mysql';

const dbConfig = {
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    database: process.env.DATABASE_NAME,
    multipleStatements: true
} as PoolConfig;

export const port: number = parseInt(process.env.port);
export default dbConfig;