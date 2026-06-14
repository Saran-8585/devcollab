import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { listProjects, getProject, createProject, updateProject, deleteProject, addCollaborator } from '../controllers/projectController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.get('/', listProjects);

router.get('/:id', (req, res, next) => {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      const token = header.split(' ')[1];
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {}
  }
  getProject(req, res, next);
});

router.post('/', auth, createProject);
router.put('/:id', auth, updateProject);
router.delete('/:id', auth, deleteProject);
router.post('/:id/collaborate', auth, addCollaborator);

export default router;
