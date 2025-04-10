import { body, validationResult } from 'express-validator';

export const validateSignup = [
  body('teamName').notEmpty().trim().escape()
    .withMessage('Team name is required'),
  body('teamLeaderName').notEmpty().trim().escape()  // Changed from leaderName to teamLeaderName
    .withMessage('Team leader name is required'),
  body('email').isEmail().normalizeEmail()
    .withMessage('Valid email is required'),
  body('studentId').notEmpty().trim().escape()
    .withMessage('Student ID is required'),
  body('password').isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }
    return true;
  }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: errors.array() 
      });
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
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: errors.array() 
      });
    }
    next();
  }
];