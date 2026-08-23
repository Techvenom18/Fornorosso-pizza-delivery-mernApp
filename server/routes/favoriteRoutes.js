const express = require('express');
const router = express.Router();
const { saveFavorite, getMyFavorites, deleteFavorite } = require('../controllers/favoriteController');
const { protect } = require('../middleware/auth');

router.post('/', protect, saveFavorite);
router.get('/', protect, getMyFavorites);
router.delete('/:id', protect, deleteFavorite);

module.exports = router;