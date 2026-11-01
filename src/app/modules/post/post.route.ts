import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLE } from '../user/user.constant';
import { PostController } from './post.controller';
import {
  createPostSchema,
  updatePostSchema,
  postParamSchema,
  userPostsParamSchema,
} from './post.validation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Posts are visible to everyone; only the author can edit or delete
 */

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a post (user, admin)
 *     tags: [Posts]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PostInput'
 *     responses:
 *       201:
 *         description: Post created
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post(
  '/', 
  auth(USER_ROLE.user, USER_ROLE.admin), validateRequest(createPostSchema), 
  PostController.createPost
);

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Feed of all posts, newest first, paginated (user, admin)
 *     tags: [Posts]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/Limit'
 *     responses:
 *       200:
 *         description: "{ results (each with author name), page, limit, totalPages, totalResults }"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get(
  '/', 
  auth(USER_ROLE.user, USER_ROLE.admin), PostController.getAllPosts
);

/**
 * @swagger
 * /posts/user/{userId}:
 *   get:
 *     summary: All posts of a user, paginated ($lookup aggregation) (user, admin)
 *     tags: [Posts]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/Limit'
 *     responses:
 *       200:
 *         description: "{ user, results, page, limit, totalPages, totalResults }"
 *       404:
 *         description: User not found
 */
router.get(
  '/user/:userId',
  auth(USER_ROLE.user, USER_ROLE.admin),
  validateRequest(userPostsParamSchema),
  PostController.getPostsByUser
);

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Get a post by id (user, admin)
 *     tags: [Posts]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Post with author name
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get(
  '/:id', 
  auth(USER_ROLE.user, USER_ROLE.admin), validateRequest(postParamSchema), 
  PostController.getPostById
);

/**
 * @swagger
 * /posts/{id}:
 *   patch:
 *     summary: Update my post (author only; user, admin)
 *     tags: [Posts]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PostInput'
 *     responses:
 *       200:
 *         description: Post updated
 *       404:
 *         description: Post not found (or not yours)
 */
router.patch(
  '/:id', 
  auth(USER_ROLE.user, USER_ROLE.admin), validateRequest(updatePostSchema), 
  PostController.updateMyPost
);

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Delete my post (author only; user, admin)
 *     tags: [Posts]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Post deleted
 *       404:
 *         description: Post not found (or not yours)
 */
router.delete(
  '/:id', 
  auth(USER_ROLE.user, USER_ROLE.admin), validateRequest(postParamSchema), 
  PostController.deleteMyPost
);

export const PostRoutes = router;