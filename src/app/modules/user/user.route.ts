import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { UserController } from './user.controller';
import { USER_ROLE } from './user.constant';
import {
  loginSchema,
  createUserSchema,
  updateUserSchema,
  userParamSchema,
} from './user.validation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Authentication and user management
 */

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login (public)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login successful (user + accessToken + refreshToken)
 *       401:
 *         description: Invalid email or password
 */
router.post(
  '/login',
   validateRequest(loginSchema), 
   UserController.loginUser
  );

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get my profile (user, admin)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get(
  '/me', 
  auth(USER_ROLE.user, USER_ROLE.admin), UserController.getMe
);

/**
 * @swagger
 * /users/interests/grouped:
 *   get:
 *     summary: Users grouped by interest (admin)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/Limit'
 *       - in: query
 *         name: interest
 *         schema: { type: string }
 *         description: Only return this interest group (uses the interests index)
 *     responses:
 *       200:
 *         description: Paginated groups [{ interest, count, users[] }]
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get(
  '/interests/grouped',
  auth(USER_ROLE.admin),
  UserController.getUsersGroupedByInterests
);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a user (admin)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUser'
 *     responses:
 *       201:
 *         description: User created
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       409:
 *         description: Email already in use
 */
router.post(
  '/',
  validateRequest(createUserSchema),
  UserController.createUser
);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: List all users, paginated (admin)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/Limit'
 *     responses:
 *       200:
 *         description: Paginated users
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/', auth(USER_ROLE.admin), UserController.getAllUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user by id (admin)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: User
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get(
  '/:id',
  auth(USER_ROLE.admin),
  validateRequest(userParamSchema),
  UserController.getUserById
);

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Update a user (admin)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUser'
 *     responses:
 *       200:
 *         description: User updated
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         description: Email already in use
 */
router.patch(
  '/:id',
  auth(USER_ROLE.admin),
  validateRequest(updateUserSchema),
  UserController.updateUser
);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user and their notes/posts (admin)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: User deleted
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete(
  '/:id',
  auth(USER_ROLE.admin),
  validateRequest(userParamSchema),
  UserController.deleteUser
);

export const UserRoutes = router;