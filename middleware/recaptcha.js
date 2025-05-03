import axios from 'axios';

export const verifyRecaptcha = async (req, res, next) => {
  // Skip verification in development environment if needed
  if (process.env.NODE_ENV === 'development' && process.env.SKIP_RECAPTCHA === 'true') {
    console.log('Skipping reCAPTCHA verification in development mode');
    return next();
  }

  const { recaptchaToken } = req.body;

  // Check if secret key is configured
  if (!process.env.RECAPTCHA_SECRET_KEY) {
    console.error('RECAPTCHA_SECRET_KEY is not set in environment variables');
    return res.status(500).json({
      success: false,
      message: 'Server configuration error'
    });
  }

  // Verify token is provided
  if (!recaptchaToken) {
    return res.status(400).json({
      success: false,
      message: 'reCAPTCHA verification failed. Please complete the captcha.'
    });
  }

  try {
    // Use URLSearchParams for proper encoding of form data
    const formData = new URLSearchParams();
    formData.append('secret', process.env.RECAPTCHA_SECRET_KEY);
    formData.append('response', recaptchaToken);
    
    // Get client IP if available to improve verification
    if (req.ip) {
      formData.append('remoteip', req.ip);
    }

    // Make request to Google's reCAPTCHA API
    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      formData.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    if (!response.data.success) {
      console.error('reCAPTCHA validation failed with errors:', response.data['error-codes']);
      return res.status(400).json({
        success: false,
        message: 'reCAPTCHA verification failed. Please try again.',
        errors: response.data['error-codes']
      });
    }

    // Optionally verify minimum score for v3 reCAPTCHA
    if (response.data.score !== undefined && response.data.score < 0.5) {
      return res.status(400).json({
        success: false,
        message: 'reCAPTCHA score too low. Please try again.'
      });
    }

    // Verification successful
    next();
  } catch (error) {
    console.error('Error calling reCAPTCHA API:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Error verifying reCAPTCHA. Please try again later.'
    });
  }
};