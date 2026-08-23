const express = require('express');
const router = express.Router();
const { subscribe } = require('../controllers/subscriberController');

// No auth required - subscribing to offer emails is public, like any newsletter signup.
router.post('/', subscribe);

module.exports = router;