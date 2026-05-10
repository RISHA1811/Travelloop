const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  updateProfile,
  updatePassword,
  deleteAccount,
  sendOtp,
  verifyOtp,
  resetPassword,
} = require('../controllers/authController');
const { read } = require('../utils/fileHelper');
const protect = require('../middleware/authMiddleware');

router.post('/signup', signup);
router.post('/login', login);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);
router.delete('/account', protect, deleteAccount);
router.get('/me', protect, (req, res) => {
  const users = read('users.json');
  const user = users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

// Forgot password flow
router.post('/forgot-password', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

module.exports = router;
