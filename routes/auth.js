import express from 'express';
import { signup, signin, getMe, logout } from '../controllers/authControllers.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.get('/me', protect, getMe);
router.get('/logout', protect, logout);

export default router;