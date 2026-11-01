import { Request } from 'express';

export const parsePagination = (query: Request['query']) => {
  const page = Math.max(parseInt(query.page as string) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit as string) || 10, 1), 100);
  return { page, limit };
};
