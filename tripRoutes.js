const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  getTrips,
  getTripById,
  getPublicTrip,
  createTrip,
  updateTrip,
  deleteTrip,
} = require('../controllers/tripController');

router.get('/public/:shareId', getPublicTrip);
router.use(protect);
router.get('/', getTrips);
router.get('/:id', getTripById);
router.post('/', createTrip);
router.put('/:id', updateTrip);
router.delete('/:id', deleteTrip);

module.exports = router;
