import axios from 'axios';

export const verifyRecaptcha = async (req, res, next) => {
  console.log('Body received:', Object.keys(req.body));
  const { recaptchaToken } = req.body;

  if (recaptchaToken) {
    console.log(`Token received with length: ${recaptchaToken.length}`);
    console.log(`Token first 10 chars: ${recaptchaToken.substring(0, 10)}...`);
  } else {
    console.log('No recaptchaToken found in request body');
  }

  if (!process.env.RECAPTCHA_SECRET_KEY) {
    console.error('RECAPTCHA_SECRET_KEY is not set in environment variables');
    return res.status(500).json({
      success: false,
      message: 'Server configuration error'
    });
  } else {
    console.log('RECAPTCHA_SECRET_KEY is set (first few chars):', 
      process.env.RECAPTCHA_SECRET_KEY.substring(0, 5) + '...');
  }

  if (!recaptchaToken) {
    return res.status(400).json({
      success: false,
      message: 'reCAPTCHA verification failed. Please complete the captcha.'
    });
  }

  try {
    console.log('Making request to Google reCAPTCHA API...');
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

    console.log('Google API response:', JSON.stringify(response.data));

    if (!response.data.success) {
      console.error('reCAPTCHA validation failed with error codes:', response.data['error-codes']);
      return res.status(400).json({
        success: false,
        message: 'reCAPTCHA verification failed. Please try again.',
        errors: response.data['error-codes']
      });
    }

    console.log('reCAPTCHA validation successful');
    next();
  } catch (error) {
    console.error('Error calling reCAPTCHA API:', error.message);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    }
    return res.status(500).json({
      success: false,
      message: 'Error verifying reCAPTCHA. Please try again later.'
    });
  }
};