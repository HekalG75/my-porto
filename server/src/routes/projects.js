const express = require('express');
const router = express.Router();
const { 
  getProjects, 
  getProjectById, 
  createProject, 
  updateProject, 
  deleteProject,
  getCategories,
  createCategory,
  deleteCategory
} = require('../controllers/projectController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../config/multer');

// Public
router.get('/', getProjects);
router.get('/categories', getCategories);
router.get('/:id', getProjectById);

// Protected (Admin)
router.post('/admin', authMiddleware, upload.single('image'), createProject);
router.put('/admin/:id', authMiddleware, upload.single('image'), updateProject);
router.delete('/admin/:id', authMiddleware, deleteProject);

router.post('/categories/admin', authMiddleware, createCategory);
router.delete('/categories/admin/:id', authMiddleware, deleteCategory);

module.exports = router;
