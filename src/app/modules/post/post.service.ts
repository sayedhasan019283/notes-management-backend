import { Types } from 'mongoose';
import httpStatus from 'http-status';
import AppError from '../../../errors/AppError';
import { Post } from './post.model';
import { User } from '../user/user.model';
import { CreatePostInput, UpdatePostInput } from './post.validation';

interface PaginationOptions {
  page: number;
  limit: number;
}

const createPost = async (authorId: string, payload: CreatePostInput) => {
  return Post.create({
    title: payload.title,
    content: payload.content,
    author: new Types.ObjectId(authorId),
  });
};

const getAllPosts = async ({ page, limit }: PaginationOptions) => {
  const [results, totalResults] = await Promise.all([
    Post.find()
      .sort({ _id: -1 }) // default _id index, newest first
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', 'name')
      .lean(),
    Post.estimatedDocumentCount(),
  ]);

  return { results, page, limit, totalPages: Math.ceil(totalResults / limit), totalResults };
};

const getPostById = async (postId: string) => {
  const post = await Post.findById(postId).populate('author', 'name').lean();
  if (!post) throw new AppError(httpStatus.NOT_FOUND, 'Post not found');
  return post;
};

const updateMyPost = async (authorId: string, postId: string, payload: UpdatePostInput) => {
  const update: UpdatePostInput = {};
  if (payload.title !== undefined) update.title = payload.title;
  if (payload.content !== undefined) update.content = payload.content;

  const post = await Post.findOneAndUpdate(
    { _id: postId, author: authorId },
    { $set: update },
    { new: true, runValidators: true }
  ).lean();

  if (!post) throw new AppError(httpStatus.NOT_FOUND, 'Post not found');
  return post;
};

const deleteMyPost = async (authorId: string, postId: string) => {
  const post = await Post.findOneAndDelete({ _id: postId, author: authorId }).lean();
  if (!post) throw new AppError(httpStatus.NOT_FOUND, 'Post not found');
  return post;
};

/**
 * Scenario 2: all posts of one user — a SINGLE aggregation pipeline with $lookup.
 * Needs MongoDB 5.0+ (localField/foreignField combined with a sub-pipeline).
 * Both lookups are served by the { author: 1, _id: -1 } index.
 */
const getPostsByUser = async (userId: string, { page, limit }: PaginationOptions) => {
  const skip = (page - 1) * limit;
  const postsCollection = Post.collection.name;

  const [result] = await User.aggregate([
    { $match: { _id: new Types.ObjectId(userId) } }, // _id index
    {
      $lookup: {
        from: postsCollection,
        localField: '_id',
        foreignField: 'author',
        pipeline: [
          { $sort: { _id: -1 } },
          { $skip: skip },
          { $limit: limit },
          { $project: { author: 0, __v: 0 } },
        ],
        as: 'posts',
      },
    },
    {
      $lookup: {
        from: postsCollection,
        localField: '_id',
        foreignField: 'author',
        pipeline: [{ $count: 'total' }],
        as: 'postCount',
      },
    },
    {
      $project: {
        name: 1,
        posts: 1,
        totalResults: { $ifNull: [{ $arrayElemAt: ['$postCount.total', 0] }, 0] },
      },
    },
  ]);

  if (!result) throw new AppError(httpStatus.NOT_FOUND, 'User not found');

  return {
    user: { _id: result._id, name: result.name },
    results: result.posts,
    page,
    limit,
    totalPages: Math.ceil(result.totalResults / limit),
    totalResults: result.totalResults,
  };
};

export const PostService = {
  createPost,
  getAllPosts,
  getPostById,
  updateMyPost,
  deleteMyPost,
  getPostsByUser,
};
