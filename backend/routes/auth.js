import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Purchase from '../models/Purchase.js';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Helper function to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
router.post('/signup', async (req, res) => {
  const { email, password, fullName, role, adminKey } = req.body;

  try {
    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({ message: 'This email is already registered. Please sign in instead.' });
    }

    let userRole = 'user';
    if (role === 'admin') {
      if (!email.endsWith('@sweetshop.com')) {
        return res.status(400).json({ message: 'Admin signup requires a @sweetshop.com email address.' });
      }
      if (adminKey !== '024') {
        return res.status(400).json({ message: 'Invalid admin registration key.' });
      }
      userRole = 'admin';
    }

    const user = await User.create({
      email,
      password,
      fullName,
      role: userRole,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        full_name: user.fullName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: error.message || 'Server error during signup.' });
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password. Please try again.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password. Please try again.' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        full_name: user.fullName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', authenticateUser, async (req, res) => {
  res.json({
    id: req.user._id,
    email: req.user.email,
    full_name: req.user.fullName,
    role: req.user.role,
    created_at: req.user.createdAt,
  });
});

// @desc    Update user profile (fullName)
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', authenticateUser, async (req, res) => {
  const { fullName } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.fullName = fullName;
    await user.save();

    res.json({
      id: user._id,
      email: user.email,
      full_name: user.fullName,
      role: user.role,
      created_at: user.createdAt,
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Server error during profile update.' });
  }
});

// @desc    Get order statistics for current user
// @route   GET /api/auth/stats
// @access  Private
router.get('/stats', authenticateUser, async (req, res) => {
  try {
    const purchases = await Purchase.find({ userId: req.user._id }).populate('sweetId');
    
    const totalOrders = purchases.length;
    const totalSpent = purchases.reduce((sum, p) => sum + Number(p.totalPrice), 0);

    // Group and find favorite category
    const categoryCount = {};
    purchases.forEach((p) => {
      const category = p.sweetId?.category;
      if (category) {
        categoryCount[category] = (categoryCount[category] || 0) + p.quantity;
      }
    });

    const favoriteCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    res.json({
      totalOrders,
      totalSpent,
      favoriteCategory,
    });
  } catch (error) {
    console.error('Stats Fetch Error:', error);
    res.status(500).json({ message: 'Server error fetching statistics.' });
  }
});

// @desc    Get all registered users with stats
// @route   GET /api/auth/users
// @access  Private/Admin
router.get('/users', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    const purchases = await Purchase.find();

    // Map stats by user ID
    const statsMap = {};
    purchases.forEach((p) => {
      const userIdStr = p.userId.toString();
      if (!statsMap[userIdStr]) {
        statsMap[userIdStr] = { totalOrders: 0, totalSpent: 0 };
      }
      statsMap[userIdStr].totalOrders += 1;
      statsMap[userIdStr].totalSpent += Number(p.totalPrice);
    });

    const formattedUsers = users.map((u) => {
      const uIdStr = u._id.toString();
      return {
        id: u._id,
        email: u.email,
        full_name: u.fullName,
        created_at: u.createdAt,
        role: u.role,
        totalOrders: statsMap[uIdStr]?.totalOrders || 0,
        totalSpent: statsMap[uIdStr]?.totalSpent || 0,
      };
    });

    res.json(formattedUsers);
  } catch (error) {
    console.error('Users Fetch Error:', error);
    res.status(500).json({ message: 'Server error fetching users list.' });
  }
});

// @desc    Delete user and their purchase history
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
router.delete('/users/:id', authenticateUser, requireAdmin, async (req, res) => {
  const userId = req.params.id;

  try {
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow deleting oneself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own admin account.' });
    }

    // Delete user purchases
    await Purchase.deleteMany({ userId });
    
    // Delete user
    await User.findByIdAndDelete(userId);

    res.json({ message: 'User and purchase history deleted successfully.' });
  } catch (error) {
    console.error('Delete User Error:', error);
    res.status(500).json({ message: 'Server error deleting user.' });
  }
});

export default router;
