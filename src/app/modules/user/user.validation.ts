import { z } from 'zod';

const objectId = z
  .string({ required_error: 'ID is required' })
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID');

const interests = z
  .array(z.string().trim().min(1).max(50))
  .max(20, 'Maximum 20 interests');

export const createUserSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }).trim().min(1).max(100),
    email: z.string({ required_error: 'Email is required' }).email(),
    password: z
      .string({ required_error: 'Password is required' })
      .min(8, 'Password must be at least 8 characters')
      .max(64),
    interests: interests.optional(),
  }),
});

export const updateUserSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(1).max(100).optional(),
      email: z.string().email().optional(),
      password: z.string().min(8).max(64).optional(),
      interests: interests.optional(),
    })
    .refine((b) => Object.keys(b).length > 0, 'Provide at least one field'),
  params: z.object({ id: objectId }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email(),
    password: z.string({ required_error: 'Password is required' }).min(1),
  }),
});

export const userParamSchema = z.object({
  params: z.object({ id: objectId }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];
