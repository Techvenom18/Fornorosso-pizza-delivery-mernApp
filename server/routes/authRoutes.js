const express = require('express');
const router = express.Router();
const {
  register,
  verifyEmail,
  login,
  verifyOtp,
  forgotPassword,
  resetPassword,
  googleAuth,
} = require('../controllers/authController');

router.post('/register', register);
router.get('/verify-email/:token', verifyEmail);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/google', googleAuth);

module.exports = router;