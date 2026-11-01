import { z } from 'zod';

const objectId = z
  .string({ required_error: 'Note ID is required' })
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid note ID');

export const createNoteSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: 'Title is required' })
      .min(1, 'Title cannot be empty')
      .max(200, 'Title must be at most 200 characters'),
    content: z
      .string({ required_error: 'Content is required' })
      .min(1, 'Content cannot be empty'),
  }),
});

export const updateNoteSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(1, 'Title cannot be empty')
      .max(200, 'Title must be at most 200 characters')
      .optional(),
    content: z.string().min(1, 'Content cannot be empty').optional(),
  }),
  params: z.object({ id: objectId }),
});

export const noteParamSchema = z.object({
  params: z.object({ id: objectId }),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>['body'];
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>['body'];
