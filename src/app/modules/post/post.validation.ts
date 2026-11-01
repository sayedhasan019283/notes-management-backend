import { z } from 'zod';

const objectId = (label: string) =>
  z
    .string({ required_error: `${label} is required` })
    .regex(/^[0-9a-fA-F]{24}$/, `Invalid ${label}`);

export const createPostSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Title is required' }).min(1).max(200),
    content: z.string({ required_error: 'Content is required' }).min(1),
  }),
});

export const updatePostSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    content: z.string().min(1).optional(),
  }),
  params: z.object({ id: objectId('Post ID') }),
});

export const postParamSchema = z.object({
  params: z.object({ id: objectId('Post ID') }),
});

export const userPostsParamSchema = z.object({
  params: z.object({ userId: objectId('User ID') }),
});

export type CreatePostInput = z.infer<typeof createPostSchema>['body'];
export type UpdatePostInput = z.infer<typeof updatePostSchema>['body'];
