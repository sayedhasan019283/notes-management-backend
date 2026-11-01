import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { parsePagination } from '../../../shared/parsePagination';
import { PostService } from './post.service';

const createPost = catchAsync(async (req: Request, res: Response) => {
  const result = await PostService.createPost(req.user.id, req.body);
  sendResponse(res, {
    code: httpStatus.CREATED,
    message: 'Post created successfully',
    data: result,
  });
});

const getAllPosts = catchAsync(async (req: Request, res: Response) => {
  const result = await PostService.getAllPosts(parsePagination(req.query));
  sendResponse(res, {
    code: httpStatus.OK,
    message: 'Posts fetched successfully',
    data: result,
  });
});

const getPostById = catchAsync(async (req: Request, res: Response) => {
  const result = await PostService.getPostById(req.params.id);
  sendResponse(res, {
    code: httpStatus.OK,
    message: 'Post fetched successfully',
    data: result,
  });
});

const getPostsByUser = catchAsync(async (req: Request, res: Response) => {
  const result = await PostService.getPostsByUser(req.params.userId, parsePagination(req.query));
  sendResponse(res, {
    code: httpStatus.OK,
    message: 'User posts fetched successfully',
    data: result,
  });
});

const updateMyPost = catchAsync(async (req: Request, res: Response) => {
  const result = await PostService.updateMyPost(req.user.id, req.params.id, req.body);
  sendResponse(res, {
    code: httpStatus.OK,
    message: 'Post updated successfully',
    data: result,
  });
});

const deleteMyPost = catchAsync(async (req: Request, res: Response) => {
  await PostService.deleteMyPost(req.user.id, req.params.id);
  sendResponse(res, {
    code: httpStatus.OK,
    message: 'Post deleted successfully',
    data: null,
  });
});

export const PostController = {
  createPost,
  getAllPosts,
  getPostById,
  getPostsByUser,
  updateMyPost,
  deleteMyPost,
};
