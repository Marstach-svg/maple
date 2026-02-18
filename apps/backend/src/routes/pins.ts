import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createPinSchema, updatePinSchema, type ApiResponse } from '@maple/shared';
import { requireAuth, requireGroupMember } from '../middleware/auth';
import { prisma } from '../utils/database';

export const pinRoutes = new Hono();

pinRoutes.post('/', requireAuth, zValidator('json', createPinSchema), async (c) => {
  try {
    const pinData = c.req.valid('json');
    const user = c.get('user');
    const groupId = c.req.header('X-Group-Id');
    
    console.log('PIN CREATE: pinData:', pinData);
    console.log('PIN CREATE: user:', user);
    console.log('PIN CREATE: groupId:', groupId);
  
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
    
    const pin = await prisma.placePin.create({
      data: {
        ...pinData,
        groupId,
        createdById: user.id,
        visitedAt: pinData.visitedAt ? new Date(pinData.visitedAt) : new Date(),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    
    const response: ApiResponse = {
      success: true,
      data: pin,
    };
    
    return c.json(response);
  } catch (error) {
    console.error('PIN CREATE ERROR:', error);
    const response: ApiResponse = {
      success: false,
      error: 'ピンの作成に失敗しました: ' + (error as Error).message,
    };
    return c.json(response, 500);
  }
});

pinRoutes.get('/group/:groupId', requireAuth, requireGroupMember, async (c) => {
  const groupId = c.get('groupId');
  
  const pins = await prisma.placePin.findMany({
    where: {
      groupId,
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      visitedAt: 'desc',
    },
  });
  
  const response: ApiResponse = {
    success: true,
    data: pins,
  };
  
  return c.json(response);
});

pinRoutes.get('/:pinId', requireAuth, async (c) => {
  const pinId = c.req.param('pinId');
  const user = c.get('user');
  
  const pin = await prisma.placePin.findUnique({
    where: { id: pinId },
    include: {
      group: {
        include: {
          members: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
  
  if (!pin) {
    const response: ApiResponse = {
      success: false,
      error: 'ピンが見つかりません',
    };
    return c.json(response, 404);
  }
  
  const isMember = pin.group.members.some(member => member.userId === user.id);
  if (!isMember) {
    const response: ApiResponse = {
      success: false,
      error: 'このピンにアクセスする権限がありません',
    };
    return c.json(response, 403);
  }
  
  const response: ApiResponse = {
    success: true,
    data: pin,
  };
  
  return c.json(response);
});

pinRoutes.put('/:pinId', requireAuth, zValidator('json', updatePinSchema), async (c) => {
  const pinId = c.req.param('pinId');
  const updateData = c.req.valid('json');
  const user = c.get('user');
  
  const pin = await prisma.placePin.findUnique({
    where: { id: pinId },
    include: {
      group: {
        include: {
          members: true,
        },
      },
    },
  });
  
  if (!pin) {
    const response: ApiResponse = {
      success: false,
      error: 'ピンが見つかりません',
    };
    return c.json(response, 404);
  }
  
  const isMember = pin.group.members.some(member => member.userId === user.id);
  if (!isMember) {
    const response: ApiResponse = {
      success: false,
      error: 'このピンを編集する権限がありません',
    };
    return c.json(response, 403);
  }
  
  const updatedPin = await prisma.placePin.update({
    where: { id: pinId },
    data: {
      ...updateData,
      visitedAt: updateData.visitedAt ? new Date(updateData.visitedAt) : undefined,
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
  
  const response: ApiResponse = {
    success: true,
    data: updatedPin,
  };
  
  return c.json(response);
});

pinRoutes.delete('/:pinId', requireAuth, async (c) => {
  const pinId = c.req.param('pinId');
  const user = c.get('user');
  
  const pin = await prisma.placePin.findUnique({
    where: { id: pinId },
    include: {
      group: {
        include: {
          members: true,
        },
      },
    },
  });
  
  if (!pin) {
    const response: ApiResponse = {
      success: false,
      error: 'ピンが見つかりません',
    };
    return c.json(response, 404);
  }
  
  const isMember = pin.group.members.some(member => member.userId === user.id);
  if (!isMember) {
    const response: ApiResponse = {
      success: false,
      error: 'このピンを削除する権限がありません',
    };
    return c.json(response, 403);
  }
  
  await prisma.placePin.delete({
    where: { id: pinId },
  });
  
  const response: ApiResponse = {
    success: true,
  };
  
  return c.json(response);
});