const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, uploadProfilePhoto, uploadAboutPhoto } = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../config/multer');

// Public
router.get('/', getProfile);

// Protected
router.put('/admin', authMiddleware, updateProfile);
router.post('/admin/upload-photo', authMiddleware, upload.single('image'), uploadProfilePhoto);
router.post('/admin/upload-about-photo', authMiddleware, upload.single('image'), uploadAboutPhoto);

module.exports = router;
