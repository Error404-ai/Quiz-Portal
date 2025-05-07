import { body, validationResult } from 'express-validator';
// import { verifyRecaptcha } from './recaptcha.js';

// Updated validateSignup with reCAPTCHA integration commented out
export const validateSignup = [
  // First verify the reCAPTCHA
  // Commented out reCAPTCHA verification
  // verifyRecaptcha,
  
  // Then proceed with the existing validation rules
  body('teamName').notEmpty().trim().escape()
    .withMessage('Team name is required'),
  body('teamLeaderName').notEmpty().trim().escape()
    .withMessage('Team leader name is required'),
  body('studentId')
    .notEmpty().withMessage('Student ID is required')
    .trim()
    .custom((value) => {
      // Updated regex to accept IDs ending with "-d"
      // Allows: 23XXXX, 24XXXX, 23XXXX-d, 24XXXX-d patterns
      const studentIdRegex = /^(23|24)\d{2,8}(-d)?$/;
      if (!studentIdRegex.test(value)) {
        throw new Error('Student ID must start with 23 or 24, be 4-10 digits long, and can optionally end with "-d"');
      }
      return true;
    }),
  body('email')
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail()
    .custom((value, { req }) => {
      if (!value.match(/^[a-zA-Z0-9._%+-]+[0-9]{4,8}(-d)?@akgec\.ac\.in$/)) {
        throw new Error('Email must be a valid AKGEC college email (ending with @akgec.ac.in)');
      }
      // Extract the base student ID (removing "-d" if present) for email validation
      const studentId = req.body.studentId.replace(/-d$/, '');
      if (!value.includes(studentId)) {
        throw new Error('Email must contain your student ID');
      }
      return true;
    }),
  // Password validation commented out
  /*
  body('password').isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }
    return true;
  }),
  */
  // Required field for reCAPTCHA token
  // body('recaptchaToken').notEmpty()
  //   .withMessage('reCAPTCHA verification is required'),
  
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