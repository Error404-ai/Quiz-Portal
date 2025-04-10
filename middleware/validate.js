import { body, validationResult } from 'express-validator';

export const validateSignup = [
  body('teamName').notEmpty().trim().escape()
    .withMessage('Team name is required'),
  body('leaderName').notEmpty().trim().escape()
    .withMessage('Leader name is required'),
  body('email').isEmail().normalizeEmail()
    .withMessage('Valid email is required'),
  body('studentId').notEmpty().trim().escape()
    .withMessage('Student ID is required'),
  body('password').isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

export const validateLogin = [
  body('email').isEmail().normalizeEmail()
    .withMessage('Valid email is required'),
  body('password').notEmpty()
    .withMessage('Password is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];