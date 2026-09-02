const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../config/generateToken');
const sendEmail = require('../config/mailer');
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @route  POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      name,
      email,
      password,
      verificationToken,
    });

    // In test/dev mode this link just points at your local frontend.
    const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email/${verificationToken}`;

    await sendEmail({
      to: user.email,
      subject: 'Verify your Pizza Delivery App account',
      html: `<p>Hi ${user.name},</p><p>Click <a href="${verifyUrl}">here</a> to verify your email.</p>`,
    });

    return res.status(201).json({
      message: 'Registered successfully. Check your email to verify your account.',
      userId: user._id,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

// @route  GET /api/auth/verify-email/:token
const verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification link' });
    }
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    return res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (err) {
    return res.status(500).json({ message: 'Verification failed', error: err.message });
  }
};

// @route  POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate a 6-digit OTP and email it, instead of logging in immediately.
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpCode = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    await sendEmail({
      to: user.email,
      subject: 'Your FornoRosso Login Code',
      html: `<p>Hi ${user.name},</p><p>Your login verification code is:</p><h2 style="letter-spacing:4px;">${otp}</h2><p>This code expires in 10 minutes.</p>`,
    });

    return res.json({ message: 'OTP sent to your email', email: user.email });
  } catch (err) {
    return res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

// @route  POST /api/auth/verify-otp
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({
      email,
      otpCode: otp,
      otpExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }

    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = generateToken(user._id, user.role);

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        avatar: user.avatar,
        bio: user.bio,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: 'Verification failed', error: err.message });
  }
};

// @route  POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always respond the same way, whether or not the user exists (avoid leaking which emails are registered)
    if (!user) {
      return res.json({ message: 'If that email exists, a reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: 'Reset your Pizza Delivery App password',
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 1 hour.</p>`,
    });

    return res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    return res.status(500).json({ message: 'Request failed', error: err.message });
  }
};

// @route  POST /api/auth/reset-password/:token
const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Reset link is invalid or has expired' });
    }

    user.password = password; // pre-save hook will hash it
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    return res.status(500).json({ message: 'Reset failed', error: err.message });
  }
};

// @route  POST /api/auth/google
// Verifies a Google ID token, then logs in an existing user or creates a new
// one automatically. No OTP needed here since Google has already verified
// the person owns this email address.
const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      // New user via Google - no password needed, but our schema requires one,
      // so generate a random unusable one (they'll only ever log in via Google).
      const randomPassword = crypto.randomBytes(20).toString('hex');
      user = await User.create({
        name,
        email,
        password: randomPassword,
        isVerified: true, // Google already verified their email
        avatar: picture || '',
      });
    }

    const token = generateToken(user._id, user.role);

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        avatar: user.avatar,
        bio: user.bio,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: 'Google authentication failed', error: err.message });
  }
};

module.exports = { register, verifyEmail, login, verifyOtp, forgotPassword, resetPassword, googleAuth };