import express from 'express';
import { UserRoutes } from '../app/modules/user/user.route';
import { NoteRoutes } from '../app/modules/note/note.route';
import { PostRoutes } from '../app/modules/post/post.route';

const router = express.Router();

const apiRoutes = [
  {
    path: '/user',
    route: UserRoutes,
  },
  {
    path: '/note',
    route: NoteRoutes,
  },
  {
    path: '/post',
    route: PostRoutes,
  },
  
];

apiRoutes.forEach((route) => router.use(route.path, route.route));

export default router;