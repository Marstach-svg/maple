import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createGroupSchema, joinGroupSchema, type ApiResponse } from '@maple/shared';
import { requireAuth, requireGroupMember } from '../middleware/auth';
import { generateInviteCode } from '../utils/auth';
import { prisma } from '../utils/database';

export const groupRoutes = new Hono();

groupRoutes.post('/', requireAuth, zValidator('json', createGroupSchema), async (c) => {
  const { name, description } = c.req.valid('json');
  const user = c.get('user');
  
  const inviteCode = generateInviteCode();
  
  const group = await prisma.coupleGroup.create({
    data: {
      name,
      description: description || null,
      inviteCode,
      members: {
        create: {
          userId: user.id,
          role: 'admin',
        },
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      },
    },
  });
  
  const response: ApiResponse = {
    success: true,
    data: group,
  };
  
  return c.json(response);
});

groupRoutes.post('/join', requireAuth, zValidator('json', joinGroupSchema), async (c) => {
  const { inviteCode } = c.req.valid('json');
  const user = c.get('user');
  
  const group = await prisma.coupleGroup.findUnique({
    where: { inviteCode },
    include: {
      members: true,
    },
  });
  
  if (!group) {
    const response: ApiResponse = {
      success: false,
      error: '無効な招待コードです',
    };
    return c.json(response, 400);
  }
  
  if (group.members.length >= 2) {
    const response: ApiResponse = {
      success: false,
      error: 'このグループは既に満員です',
    };
    return c.json(response, 400);
  }
  
  const existingMember = group.members.find(member => member.userId === user.id);
  if (existingMember) {
    const response: ApiResponse = {
      success: false,
      error: '既にこのグループのメンバーです',
    };
    return c.json(response, 400);
  }
  
  await prisma.groupMember.create({
    data: {
      userId: user.id,
      groupId: group.id,
      role: 'member',
    },
  });
  
  const updatedGroup = await prisma.coupleGroup.findUnique({
    where: { id: group.id },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      },
    },
  });
  
  const response: ApiResponse = {
    success: true,
    data: updatedGroup,
  };
  
  return c.json(response);
});

groupRoutes.get('/', requireAuth, async (c) => {
  const user = c.get('user');
  
  const groups = await prisma.coupleGroup.findMany({
    where: {
      members: {
        some: {
          userId: user.id,
        },
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      },
      _count: {
        select: {
          pins: true,
        },
      },
    },
  });
  
  const response: ApiResponse = {
    success: true,
    data: groups,
  };
  
  return c.json(response);
});

groupRoutes.get('/:groupId/prefecture-stats', requireAuth, requireGroupMember, async (c) => {
  const groupId = c.get('groupId');
  
  const stats = await prisma.placePin.groupBy({
    by: ['prefecture'],
    where: {
      groupId,
    },
    _count: {
      prefecture: true,
    },
  });
  
  const formattedStats = stats.map(stat => ({
    prefecture: stat.prefecture,
    count: stat._count.prefecture,
  }));
  
  const response: ApiResponse = {
    success: true,
    data: formattedStats,
  };
  
  return c.json(response);
});