import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { loginSchema, registerSchema, type ApiResponse } from '@maple/shared';
import { 
  hashPassword, 
  verifyPassword, 
  isEmailAllowed,
  setSessionCookie,
  clearSessionCookie,
  getSessionFromCookie
} from '../utils/auth';
import { prisma } from '../utils/database';
import { requireAuth } from '../middleware/auth';

export const authRoutes = new Hono();

authRoutes.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json');
  
  if (!isEmailAllowed(email)) {
    const response: ApiResponse = {
      success: false,
      error: 'このメールアドレスでのログインは許可されていません',
    };
    return c.json(response, 403);
  }
  
  const user = await prisma.user.findUnique({
    where: { email },
  });
  
  if (!user || !(await verifyPassword(password, user.password))) {
    const response: ApiResponse = {
      success: false,
      error: 'メールアドレスまたはパスワードが正しくありません',
    };
    return c.json(response, 401);
  }
  
  setSessionCookie(c, {
    userId: user.id,
    email: user.email,
  });
  
  const response: ApiResponse = {
    success: true,
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  };
  
  return c.json(response);
});

authRoutes.post('/register', zValidator('json', registerSchema), async (c) => {
  const { email, name, password } = c.req.valid('json');
  
  if (!isEmailAllowed(email)) {
    const response: ApiResponse = {
      success: false,
      error: 'このメールアドレスでの登録は許可されていません',
    };
    return c.json(response, 403);
  }
  
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  
  if (existingUser) {
    const response: ApiResponse = {
      success: false,
      error: 'このメールアドレスは既に登録されています',
    };
    return c.json(response, 400);
  }
  
  const hashedPassword = await hashPassword(password);
  
  const user = await prisma.user.create({
    data: {
      email,
      name: name || null,
      password: hashedPassword,
    },
  });
  
  setSessionCookie(c, {
    userId: user.id,
    email: user.email,
  });
  
  const response: ApiResponse = {
    success: true,
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  };
  
  return c.json(response);
});

authRoutes.post('/logout', (c) => {
  clearSessionCookie(c);
  
  const response: ApiResponse = {
    success: true,
  };
  
  return c.json(response);
});

authRoutes.get('/me', requireAuth, async (c) => {
  const user = c.get('user');
  
  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  
  const response: ApiResponse = {
    success: true,
    data: fullUser,
  };
  
  return c.json(response);
});