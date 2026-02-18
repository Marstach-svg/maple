import { z } from 'zod';

export const createGroupSchema = z.object({
  name: z.string().min(1, 'グループ名を入力してください'),
  description: z.string().optional(),
});

export const joinGroupSchema = z.object({
  inviteCode: z.string().min(1, '招待コードを入力してください'),
});

export const groupSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  inviteCode: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const groupMemberSchema = z.object({
  id: z.string(),
  userId: z.string(),
  groupId: z.string(),
  role: z.string(),
});

export type CreateGroupRequest = z.infer<typeof createGroupSchema>;
export type JoinGroupRequest = z.infer<typeof joinGroupSchema>;
export type Group = z.infer<typeof groupSchema>;
export type GroupMember = z.infer<typeof groupMemberSchema>;