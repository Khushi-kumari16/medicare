/*import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "./schema";
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql });
export const db = drizzle(client);*/

// Change the extension from .tsx to .ts if there's no JSX!

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const client = postgres(process.env.DATABASE_URL!); // make sure this env variable is set
export const db = drizzle(client); // <== THIS is what you're trying to import
