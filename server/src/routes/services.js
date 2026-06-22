const express = require('express');
const router = express.Router();
const { getServices, getAllServices, createService, updateService, deleteService } = require('../controllers/serviceController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', getServices);
router.get('/admin/all', authMiddleware, getAllServices);
router.post('/admin', authMiddleware, createService);
router.put('/admin/:id', authMiddleware, updateService);
router.delete('/admin/:id', authMiddleware, deleteService);

module.exports = router;
