const express = require('express');
const router = express.Router();
const {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
} = require('../controllers/bookController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.route('/')
  .get(getBooks);

router.route('/:id')
  .get(getBookById);

// Protected admin routes
router.route('/')
  .post(protect, admin, createBook);

router.route('/:id')
  .put(protect, admin, updateBook)
  .delete(protect, admin, deleteBook);

module.exports = router;
