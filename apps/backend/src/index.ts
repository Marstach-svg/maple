import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { authRoutes } from './routes/auth';
import { groupRoutes } from './routes/groups';
import { pinRoutes } from './routes/pins';

const app = new Hono();

app.use('*', logger());
app.use('*', cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.route('/auth', authRoutes);
app.route('/groups', groupRoutes);
app.route('/pins', pinRoutes);

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const port = parseInt(process.env.PORT || '3001');

export default {
  port,
  fetch: app.fetch,
};