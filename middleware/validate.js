import { body, validationResult } from 'express-validator';
import { verifyRecaptcha } from './recaptcha.js';

// Updated validateSignup with reCAPTCHA integration
export const validateSignup = [
  // First verify the reCAPTCHA
  verifyRecaptcha,
  
  // Then proceed with the existing validation rules
  body('teamName').notEmpty().trim().escape()
    .withMessage('Team name is required'),
  body('teamLeaderName').notEmpty().trim().escape()
    .withMessage('Team leader name is required'),
  body('studentId')
    .notEmpty().withMessage('Student ID is required')
    .trim()
    .isLength({ min: 4, max: 10 }).withMessage('Student ID must be between 4 and 10 digits')
    .matches(/^(23|24)\d{2,8}$/).withMessage('Student ID must start with 23 or 24 and be 4-10 digits long'),
  body('email')
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail()
    .custom((value, { req }) => {
      if (!value.match(/^[a-zA-Z0-9._%+-]+[0-9]{4,8}@akgec\.ac\.in$/)) {
        throw new Error('Email must be a valid AKGEC college email (ending with @akgec.ac.in)');
      }
      const studentId = req.body.studentId;
      if (!value.includes(studentId)) {
        throw new Error('Email must contain your student ID');
      }
      return true;
    }),
  body('password').isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }
    return true;
  }),
  // Required field for reCAPTCHA token
  body('recaptchaToken').notEmpty()
    .withMessage('reCAPTCHA verification is required'),
  
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