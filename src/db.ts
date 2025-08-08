import { Pool } from 'pg';
import * as dotenv from 'dotenv'

dotenv.config();

export const pool = new Pool({
    host: process.env.HOSTNAME,
    port: 5432,
    user: process.env.USERNAME,
    password: process.env.PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
})