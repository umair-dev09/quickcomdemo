// Database connection and query utilities
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Create PostgreSQL connection
const connectionString = process.env.DATABASE_URL!;

// Disable prefetch for Next.js serverless functions
const client = postgres(connectionString, { prepare: false });

// Create Drizzle instance
export const db = drizzle(client, { schema });

// Export schema for easy access
export { schema };
