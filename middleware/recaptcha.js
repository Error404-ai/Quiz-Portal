import axios from 'axios';

export const verifyRecaptcha = async (req, res, next) => {
  const { recaptchaToken } = req.body;
  
  // If no token is provided in the request body
  if (!recaptchaToken) {
    return res.status(400).json({
      success: false,
      message: 'reCAPTCHA verification failed. Please complete the captcha.'
    });
  }

  try {
    // Verify the reCAPTCHA token with Google's API
    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: recaptchaToken
        }
      }
    );

    // Check if verification was successful
    if (!response.data.success) {
      return res.status(400).json({
        success: false,
        message: 'reCAPTCHA verification failed. Please try again.'
      });
    }

    // If verification succeeded, proceed to the next middleware
    next();
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error verifying reCAPTCHA. Please try again later.'
    });
  }
};