const express = require('express');
const router = express.Router();
const { getProfileStats, updateProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/auth');

router.get('/stats', protect, getProfileStats);
router.patch('/', protect, updateProfile);

module.exports = router;