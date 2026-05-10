const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { read, write } = require('../utils/fileHelper');

// In-memory OTP store: { email: { otp, expiresAt, verified } }
const otpStore = {};

const generateToken = (user) =>
  jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields required' });

    const users = read('users.json');
    if (users.find((u) => u.email === email))
      return res.status(400).json({ message: 'Email already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = {
      id: uuidv4(),
      name,
      email,
      password: hashed,
      role: users.length === 0 ? 'admin' : 'user',
    };
    users.push(user);
    write('users.json', users);

    res.status(201).json({
      token: generateToken(user),
      user: { id: user.id, name, email, role: user.role },
    });
  } catch (e) {
    console.error('signup error:', e);
    res.status(500).json({ message: e.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = read('users.json');
    const user = users.find((u) => u.email === email);
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    res.json({
      token: generateToken(user),
      user: { id: user.id, name: user.name, email, role: user.role || 'user' },
    });
  } catch (e) {
    console.error('login error:', e);
    res.status(500).json({ message: e.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Name required' });

    const users = read('users.json');
    const idx = users.findIndex((u) => u.id === req.user.id);
    if (idx === -1) return res.status(404).json({ message: 'User not found' });

    users[idx].name = name;
    write('users.json', users);
    res.json({ name });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: 'Both passwords required' });

    if (newPassword.length < 6)
      return res.status(400).json({ message: 'New password must be at least 6 characters' });

    const users = read('users.json');
    const idx = users.findIndex((u) => u.id === req.user.id);

    if (idx === -1)
      return res.status(404).json({ message: 'User not found. Please log out and log in again.' });

    const match = await bcrypt.compare(currentPassword, users[idx].password);
    if (!match)
      return res.status(400).json({ message: 'Current password is incorrect. Please try again.' });

    users[idx].password = await bcrypt.hash(newPassword, 10);
    write('users.json', users);
    res.json({ message: 'Password updated successfully' });
  } catch (e) {
    console.error('updatePassword error:', e);
    res.status(500).json({ message: e.message });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const users = read('users.json');
    const idx = users.findIndex((u) => u.id === req.user.id);
    if (idx === -1)
      return res.status(404).json({ message: 'User not found' });

    // Remove user
    users.splice(idx, 1);
    write('users.json', users);

    // Also delete all trips belonging to this user
    const trips = read('trips.json');
    write('trips.json', trips.filter((t) => t.userId !== req.user.id));

    res.json({ message: 'Account deleted successfully' });
  } catch (e) {
    console.error('deleteAccount error:', e);
    res.status(500).json({ message: e.message });
  }
};

// POST /api/auth/forgot-password
const sendOtp = (req, res) => {
  try {
    const { email } = req.body;
    console.log('[sendOtp] called with email:', email);

    if (!email) return res.status(400).json({ message: 'Email is required' });

    const users = read('users.json');
    console.log('[sendOtp] total users:', users.length);

    const user = users.find((u) => u.email === email);
    if (!user) {
      console.log('[sendOtp] no user found for:', email);
      return res.status(404).json({ message: 'No account found with this email' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { otp, expiresAt: Date.now() + 10 * 60 * 1000, verified: false };

    console.log(`[sendOtp] OTP for ${email} → ${otp}`);

    return res.status(200).json({ message: 'OTP generated successfully', otp });
  } catch (e) {
    console.error('[sendOtp] crash:', e);
    return res.status(500).json({ message: 'Server error: ' + e.message });
  }
};

// POST /api/auth/verify-otp
const verifyOtp = (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP required' });

    const record = otpStore[email];
    if (!record) return res.status(400).json({ message: 'No OTP found. Please request one first.' });

    if (Date.now() > record.expiresAt) {
      delete otpStore[email];
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    if (record.otp !== otp.trim())
      return res.status(400).json({ message: 'Invalid OTP. Please check and try again.' });

    otpStore[email].verified = true;
    return res.status(200).json({ message: 'OTP verified' });
  } catch (e) {
    console.error('[verifyOtp] crash:', e);
    return res.status(500).json({ message: 'Server error: ' + e.message });
  }
};

// POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword)
      return res.status(400).json({ message: 'All fields required' });

    const record = otpStore[email];
    if (!record || !record.verified)
      return res.status(400).json({ message: 'OTP not verified. Please verify OTP first.' });

    if (Date.now() > record.expiresAt) {
      delete otpStore[email];
      return res.status(400).json({ message: 'OTP expired. Please start over.' });
    }

    if (record.otp !== otp.trim())
      return res.status(400).json({ message: 'Invalid OTP' });

    if (newPassword.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const users = read('users.json');
    const idx = users.findIndex((u) => u.email === email);
    if (idx === -1) return res.status(404).json({ message: 'User not found' });

    users[idx].password = await bcrypt.hash(newPassword, 10);
    write('users.json', users);
    delete otpStore[email];

    return res.status(200).json({ message: 'Password reset successfully' });
  } catch (e) {
    console.error('[resetPassword] crash:', e);
    return res.status(500).json({ message: 'Server error: ' + e.message });
  }
};

module.exports = { signup, login, updateProfile, updatePassword, deleteAccount, sendOtp, verifyOtp, resetPassword };
