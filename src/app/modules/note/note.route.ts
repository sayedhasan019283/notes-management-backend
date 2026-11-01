import { Router } from 'express';
import { NoteController } from './note.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { createNoteSchema, updateNoteSchema, noteParamSchema } from './note.validation';
import { USER_ROLE } from '../user/user.constant';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Notes
 *   description: Notes (users manage their own, admins can view everyone's)
 */

/**
 * @swagger
 * /notes:
 *   post:
 *     summary: Create a note (user, admin)
 *     tags: [Notes]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NoteInput'
 *     responses:
 *       201:
 *         description: Note created
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post(
  '/',
  auth(USER_ROLE.user, USER_ROLE.admin),
  validateRequest(createNoteSchema),
  NoteController.createNote
);

/**
 * @swagger
 * /notes/my:
 *   get:
 *     summary: List my notes, paginated (user, admin)
 *     tags: [Notes]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/Limit'
 *     responses:
 *       200:
 *         description: Paginated notes
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get(
  '/my', 
  auth(USER_ROLE.user, USER_ROLE.admin), NoteController.getMyNotes
);

/**
 * @swagger
 * /notes/my/{id}:
 *   get:
 *     summary: Get one of my notes (user, admin)
 *     tags: [Notes]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Note
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get(
  '/my/:id',
  auth(USER_ROLE.user, USER_ROLE.admin),
  validateRequest(noteParamSchema),
  NoteController.getMyNoteById
);

/**
 * @swagger
 * /notes/my/{id}:
 *   patch:
 *     summary: Update one of my notes (user, admin)
 *     tags: [Notes]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NoteInput'
 *     responses:
 *       200:
 *         description: Note updated
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch(
  '/my/:id',
  auth(USER_ROLE.user, USER_ROLE.admin),
  validateRequest(updateNoteSchema),
  NoteController.updateMyNote
);

/**
 * @swagger
 * /notes/my/{id}:
 *   delete:
 *     summary: Delete one of my notes (user, admin)
 *     tags: [Notes]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Note deleted
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete(
  '/my/:id',
  auth(USER_ROLE.user, USER_ROLE.admin),
  validateRequest(noteParamSchema),
  NoteController.deleteMyNote
);

/**
 * @swagger
 * /notes:
 *   get:
 *     summary: List everyone's notes, paginated (admin)
 *     tags: [Notes]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/Limit'
 *     responses:
 *       200:
 *         description: Paginated notes with owner name/email
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/', auth(USER_ROLE.admin), NoteController.getAllNotes);

/**
 * @swagger
 * /notes/{id}:
 *   get:
 *     summary: Get any note by id (admin)
 *     tags: [Notes]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Note
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get(
  '/:id',
  auth(USER_ROLE.admin),
  validateRequest(noteParamSchema),
  NoteController.getNoteById
);

export const NoteRoutes = router;