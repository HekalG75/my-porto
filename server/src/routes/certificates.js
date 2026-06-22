const express = require('express');
const router = express.Router();
const { getCertificates, createCertificate, updateCertificate, deleteCertificate } = require('../controllers/certificateController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../config/multer');

router.get('/', getCertificates);
router.post('/admin', authMiddleware, upload.single('image'), createCertificate);
router.put('/admin/:id', authMiddleware, upload.single('image'), updateCertificate);
router.delete('/admin/:id', authMiddleware, deleteCertificate);

module.exports = router;
