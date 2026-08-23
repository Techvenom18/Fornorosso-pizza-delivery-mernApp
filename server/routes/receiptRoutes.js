const express = require('express');
const router = express.Router();
const { logReceipt, getMyReceipts } = require('../controllers/receiptController');
const { protect } = require('../middleware/auth');

router.post('/', protect, logReceipt);
router.get('/', protect, getMyReceipts);

module.exports = router;