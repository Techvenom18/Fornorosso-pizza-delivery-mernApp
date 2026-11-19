/**
 * End-to-end auth flow test.
 *   node e2e-auth.test.js                       -> against local server (http://localhost:5000/api)
 *   E2E_BASE_URL=https://fornorosso-backend.onrender.com/api node e2e-auth.test.js
 *
 * Registers a throwaway user, verifies the email, logs in (OTP), exchanges the
 * OTP for a JWT, hits a protected route, then deletes the test user.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const BASE = process.env.E2E_BASE_URL || 'http://localhost:5000/api';
const email = `e2e.test.${Date.now()}@example.com`;
const password = 'Test123456';

let failures = 0;
const check = (label, ok, extra = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${extra ? ` -> ${extra}` : ''}`);
  if (!ok) failures += 1;
};

const call = async (method, path, body, token) => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* no body */
  }
  return { status: res.status, data };
};

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  // Sweep any leftover test users from previous/failed runs
  await User.deleteMany({ email: /^e2e\.test\./ });
  console.log(`\nE2E auth test against: ${BASE}\nUser: ${email}\n`);

  // 1. Signup
  const reg = await call('POST', '/auth/register', { name: 'E2E Tester', email, password });
  check('POST /auth/register -> 201', reg.status === 201, `${reg.status} ${JSON.stringify(reg.data)}`);

  // 2. Email verification link
  let dbUser = await User.findOne({ email });
  check('user persisted in DB', !!dbUser);
  check('verification token stored', !!(dbUser && dbUser.verificationToken));

  const verify = await call('GET', `/auth/verify-email/${dbUser.verificationToken}`);
  check('GET /auth/verify-email/:token -> 200', verify.status === 200, `${verify.status} ${JSON.stringify(verify.data)}`);

  dbUser = await User.findOne({ email });
  check('isVerified flipped to true', dbUser.isVerified === true);
  check('verification token cleared on save', !dbUser.verificationToken, String(dbUser.verificationToken));

  // 3. Login with correct credentials -> OTP issued
  const login = await call('POST', '/auth/login', { email, password });
  check('POST /auth/login -> 200 (OTP sent)', login.status === 200, `${login.status} ${JSON.stringify(login.data)}`);

  dbUser = await User.findOne({ email }).select('+otpCode');
  check('OTP stored in DB', !!(dbUser.otpCode && dbUser.otpExpires), String(dbUser.otpCode));

  // 3b. Login with wrong password must fail
  const badLogin = await call('POST', '/auth/login', { email, password: 'wrong-password' });
  check('POST /auth/login wrong password -> 401', badLogin.status === 401, String(badLogin.status));

  // 4. OTP exchange -> JWT
  const otp = dbUser.otpCode;
  const verifyOtp = await call('POST', '/auth/verify-otp', { email, otp });
  check('POST /auth/verify-otp -> 200 + token', verifyOtp.status === 200 && !!verifyOtp.data.token,
    `${verifyOtp.status} ${JSON.stringify(verifyOtp.data).slice(0, 160)}`);
  check('user payload returned', !!verifyOtp.data?.user?.email, verifyOtp.data?.user?.email);

  // 4b. OTP must not be reusable
  const reuse = await call('POST', '/auth/verify-otp', { email, otp });
  check('OTP cannot be reused -> 400', reuse.status === 400, String(reuse.status));

  // 5. Protected route with the fresh token
  const stats = await call('GET', '/profile/stats', null, verifyOtp.data.token);
  check('GET /profile/stats with JWT -> 200', stats.status === 200, `${stats.status} ${JSON.stringify(stats.data).slice(0, 160)}`);

  const noAuth = await call('GET', '/profile/stats');
  check('GET /profile/stats without JWT -> 401', noAuth.status === 401, String(noAuth.status));

  // 6. Cleanup
  await User.deleteOne({ email });
  check('test user deleted', true);

  await mongoose.disconnect();
  console.log(`\n${failures === 0 ? 'ALL PASSED' : `${failures} FAILED`}\n`);
  process.exit(failures === 0 ? 0 : 1);
})().catch(async (err) => {
  console.error('E2E crashed:', err);
  try {
    await User.deleteOne({ email });
    await mongoose.disconnect();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
