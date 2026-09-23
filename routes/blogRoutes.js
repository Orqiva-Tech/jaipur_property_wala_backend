const express = require('express');
const router = express.Router();
const {
  getBlogs,
  getBlogBySlug,
  getAllBlogs,
  createBlog,
  updateBlog,
  deleteBlog
} = require('../controllers/blogController');
const { protectAdmin } = require('../middleware/auth');

// Public
router.get('/', getBlogs);
router.get('/:slug', getBlogBySlug);

// Admin
router.get('/admin/all', protectAdmin, getAllBlogs);
router.post('/admin', protectAdmin, createBlog);
router.put('/admin/:id', protectAdmin, updateBlog);
router.delete('/admin/:id', protectAdmin, deleteBlog);

module.exports = router;
