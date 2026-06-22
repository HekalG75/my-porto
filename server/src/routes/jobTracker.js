const express = require('express');
const router = express.Router();
const { getJobs, getJobStats, createJob, updateJob, updateJobStatus, deleteJob } = require('../controllers/jobTrackerController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware); // Semua route job tracker butuh auth

router.get('/', getJobs);
router.get('/stats', getJobStats);
router.post('/', createJob);
router.put('/:id', updateJob);
router.patch('/:id/status', updateJobStatus);
router.delete('/:id', deleteJob);

module.exports = router;
