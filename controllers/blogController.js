const Blog = require('../models/Blog');

// @desc    Get published blogs
// @route   GET /api/blogs
// @access  Public
const getBlogs = async (req, res, next) => {
  try {
    const { category, search, tag } = req.query;
    const query = { isPublished: true };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (tag) {
      query.tags = tag;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const blogs = await Blog.find(query).sort({ publishedAt: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: blogs.length,
      data: blogs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single blog by slug
// @route   GET /api/blogs/:slug
// @access  Public
const getBlogBySlug = async (req, res, next) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    blog.views = (blog.views || 0) + 1;
    await blog.save({ validateBeforeSave: false });

    const related = await Blog.find({
      _id: { $ne: blog._id },
      isPublished: true
    }).limit(3);

    res.status(200).json({
      success: true,
      data: blog,
      related
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all blogs including drafts (Admin)
// @route   GET /api/admin/blogs
// @access  Protected (Admin)
const getAllBlogs = async (req, res, next) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: blogs.length,
      data: blogs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create blog
// @route   POST /api/admin/blogs
// @access  Protected (Admin)
const createBlog = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (typeof data.tags === 'string') {
      data.tags = data.tags.split(',').map(t => t.trim()).filter(Boolean);
    }
    const blog = await Blog.create(data);
    res.status(201).json({
      success: true,
      message: 'Article published successfully',
      data: blog
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update blog
// @route   PUT /api/admin/blogs/:id
// @access  Protected (Admin)
const updateBlog = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (typeof data.tags === 'string') {
      data.tags = data.tags.split(',').map(t => t.trim()).filter(Boolean);
    }

    const blog = await Blog.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true
    });

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Article updated successfully',
      data: blog
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete blog
// @route   DELETE /api/admin/blogs/:id
// @access  Protected (Admin)
const deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }
    await blog.deleteOne();
    res.status(200).json({ success: true, message: 'Article deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBlogs,
  getBlogBySlug,
  getAllBlogs,
  createBlog,
  updateBlog,
  deleteBlog
};
