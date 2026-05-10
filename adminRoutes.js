const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { getAdminStats, updateUser, deleteUser, adminDeleteTrip } = require('../controllers/adminController');

router.use(protect);
router.get('/stats', getAdminStats);
router.put('/users/:userId', updateUser);
router.delete('/users/:userId', deleteUser);
router.delete('/trips/:tripId', adminDeleteTrip);

module.exports = router;
