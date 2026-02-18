import { config } from 'dotenv';
import { resolve } from 'path';
import { serve } from '@hono/node-server';
import app from './index';

// Load .env from project root
config({ path: resolve(process.cwd(), '../..', '.env') });

const port = parseInt(process.env.PORT || '3001');

console.log(`Starting server on port ${port}`);
console.log(`Environment check:`);
console.log(`- JWT_SECRET: ${process.env.JWT_SECRET ? 'SET' : 'NOT SET'}`);
console.log(`- ALLOWED_EMAILS: ${process.env.ALLOWED_EMAILS || 'NOT SET'}`);

serve({
  fetch: app.fetch,
  port,
});