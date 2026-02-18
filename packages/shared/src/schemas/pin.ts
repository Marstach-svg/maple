import { z } from 'zod';

export const createPinSchema = z.object({
  title: z.string().min(1, 'タイトルを入力してください'),
  description: z.string().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  prefecture: z.string().min(1, '都道府県を選択してください'),
  address: z.string().optional(),
  visitedAt: z.string().datetime().optional(),
});

export const updatePinSchema = createPinSchema.partial();

export const pinSchema = z.object({
  id: z.string(),
  groupId: z.string(),
  createdById: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  latitude: z.number(),
  longitude: z.number(),
  prefecture: z.string(),
  address: z.string().nullable(),
  visitedAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const prefectureStatsSchema = z.object({
  prefecture: z.string(),
  count: z.number(),
});

export type CreatePinRequest = z.infer<typeof createPinSchema>;
export type UpdatePinRequest = z.infer<typeof updatePinSchema>;
export type Pin = z.infer<typeof pinSchema>;
export type PrefectureStats = z.infer<typeof prefectureStatsSchema>;