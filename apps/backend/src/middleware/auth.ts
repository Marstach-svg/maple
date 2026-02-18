import type { Context, Next } from 'hono';
import { getSessionFromCookie } from '../utils/auth';
import { prisma } from '../utils/database';
import type { ApiResponse } from '@maple/shared';

export interface AuthContext extends Context {
  get: {
    user: {
      id: string;
      email: string;
    };
  };
}

export const requireAuth = async (c: Context, next: Next) => {
  const session = getSessionFromCookie(c);
  
  if (!session) {
    const response: ApiResponse = {
      success: false,
      error: '認証が必要です',
    };
    return c.json(response, 401);
  }
  
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true },
  });
  
  if (!user) {
    const response: ApiResponse = {
      success: false,
      error: 'ユーザーが見つかりません',
    };
    return c.json(response, 401);
  }
  
  c.set('user', user);
  await next();
};

export const requireGroupMember = async (c: Context, next: Next) => {
  const user = c.get('user');
  const groupId = c.req.param('groupId');
  
  if (!groupId) {
    const response: ApiResponse = {
      success: false,
      error: 'グループIDが必要です',
    };
    return c.json(response, 400);
  }
  
  const membership = await prisma.groupMember.findUnique({
    where: {
      userId_groupId: {
        userId: user.id,
        groupId: groupId,
      },
    },
  });
  
  if (!membership) {
    const response: ApiResponse = {
      success: false,
      error: 'このグループにアクセスする権限がありません',
    };
    return c.json(response, 403);
  }
  
  c.set('groupId', groupId);
  await next();
};