
import express from 'express';
import { signup, signin, getMe, logout, refreshToken } from '../controllers/authControllers.js';
import { validateSignup, validateLogin } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Changed to use validateSignup middleware which has been modified
router.post('/signup', validateSignup, signup);
router.post('/signin', validateLogin, signin);
router.post('/refresh-token', refreshToken);
router.get('/me', protect, getMe);
router.get('/logout', protect, logout);

export default router;