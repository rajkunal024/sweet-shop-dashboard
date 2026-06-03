import express from 'express';
import Purchase from '../models/Purchase.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get purchase history for logged-in user
// @route   GET /api/purchases
// @access  Private
router.get('/', authenticateUser, async (req, res) => {
  try {
    const purchases = await Purchase.find({ userId: req.user._id })
      .populate('sweetId')
      .sort({ createdAt: -1 });

    const formattedPurchases = purchases.map((p) => ({
      id: p._id,
      quantity: p.quantity,
      total_price: p.totalPrice,
      created_at: p.createdAt,
      sweet: p.sweetId
        ? {
            id: p.sweetId._id,
            name: p.sweetId.name,
            image_url: p.sweetId.imageUrl || null,
            category: p.sweetId.category,
          }
        : null,
    }));

    res.json(formattedPurchases);
  } catch (error) {
    console.error('Fetch Purchases Error:', error);
    res.status(500).json({ message: 'Server error fetching purchase history.' });
  }
});

export default router;
