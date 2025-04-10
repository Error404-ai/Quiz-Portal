// routes/auth.js
const express = require('express');
const router = express.Router();
const { signup, signin, getMe, logout } = require('../authControllers');
const { protect } = require('../middleware/auth');

router.post('/signup', signup);
router.post('/signin', signin);
router.get('/me', protect, getMe);
router.get('/logout', protect, logout);

module.exports = router;