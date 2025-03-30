// src/db.ts
import { neon } from '@neondatabase/serverless';

// const sql = neon('postgresql://neondb_owner:npg_jLiasfem92WN@ep-broad-poetry-a55ul0er-pooler.us-east-2.aws.neon.tech/Chat?sslmode=require');
const sql = neon("postgresql://neondb_owner:npg_jLiasfem92WN@ep-broad-poetry-a55ul0er-pooler.us-east-2.aws.neon.tech/Chat?sslmode=require");
export default sql;