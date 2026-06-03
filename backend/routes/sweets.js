import express from 'express';
import Sweet from '../models/Sweet.js';
import Purchase from '../models/Purchase.js';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Helper to map Sweet model to Supabase shape expected by frontend
export const mapSweet = (s) => {
  if (!s) return null;
  return {
    id: s._id,
    name: s.name,
    category: s.category,
    price: s.price,
    quantity: s.quantity,
    description: s.description || null,
    image_url: s.imageUrl || null,
    created_at: s.createdAt,
    updated_at: s.updatedAt,
  };
};

// @desc    Get all sweets with filters
// @route   GET /api/sweets
// @access  Private (or Public, but frontend has them when logged in or out, check Index.tsx)
router.get('/', async (req, res) => {
  const { searchQuery, category, minPrice, maxPrice } = req.query;

  try {
    const filter = {};

    if (searchQuery) {
      filter.name = { $regex: searchQuery, $options: 'i' };
    }

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) {
        filter.price.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    const sweets = await Sweet.find(filter).sort({ name: 1 });
    res.json(sweets.map(mapSweet));
  } catch (error) {
    console.error('Fetch Sweets Error:', error);
    res.status(500).json({ message: 'Server error fetching sweets.' });
  }
});

// @desc    Create a new sweet
// @route   POST /api/sweets
// @access  Private/Admin
router.post('/', authenticateUser, requireAdmin, async (req, res) => {
  const { name, category, price, quantity, description, image_url } = req.body;

  try {
    const sweet = await Sweet.create({
      name,
      category,
      price: Number(price),
      quantity: Number(quantity) || 0,
      description,
      imageUrl: image_url,
    });

    res.status(201).json(mapSweet(sweet));
  } catch (error) {
    console.error('Create Sweet Error:', error);
    res.status(500).json({ message: 'Server error creating sweet.' });
  }
});

// @desc    Update sweet details
// @route   PUT /api/sweets/:id
// @access  Private/Admin
router.put('/:id', authenticateUser, requireAdmin, async (req, res) => {
  const { name, category, price, quantity, description, image_url } = req.body;

  try {
    const sweet = await Sweet.findById(req.params.id);
    if (!sweet) {
      return res.status(404).json({ message: 'Sweet not found' });
    }

    sweet.name = name ?? sweet.name;
    sweet.category = category ?? sweet.category;
    sweet.price = price !== undefined ? Number(price) : sweet.price;
    sweet.quantity = quantity !== undefined ? Number(quantity) : sweet.quantity;
    sweet.description = description ?? sweet.description;
    sweet.imageUrl = image_url ?? sweet.imageUrl;

    await sweet.save();
    res.json(mapSweet(sweet));
  } catch (error) {
    console.error('Update Sweet Error:', error);
    res.status(500).json({ message: 'Server error updating sweet.' });
  }
});

// @desc    Delete a sweet
// @route   DELETE /api/sweets/:id
// @access  Private/Admin
router.delete('/:id', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const sweet = await Sweet.findById(req.params.id);
    if (!sweet) {
      return res.status(404).json({ message: 'Sweet not found' });
    }

    await Sweet.findByIdAndDelete(req.params.id);
    // Also clean up any purchases referencing this sweet if needed, or leave it
    // In Supabase it's ON DELETE CASCADE for purchases
    await Purchase.deleteMany({ sweetId: req.params.id });

    res.json({ message: 'Sweet deleted successfully.' });
  } catch (error) {
    console.error('Delete Sweet Error:', error);
    res.status(500).json({ message: 'Server error deleting sweet.' });
  }
});

// @desc    Purchase a sweet (decrements stock, records purchase)
// @route   POST /api/sweets/:id/purchase
// @access  Private
router.post('/:id/purchase', authenticateUser, async (req, res) => {
  const sweetId = req.params.id;
  const quantity = Number(req.body.quantity) || 1;

  try {
    // Basic atomic inventory check and decrement
    // We fetch the document first
    const sweet = await Sweet.findById(sweetId);
    if (!sweet) {
      return res.status(404).json({ message: 'Sweet not found' });
    }

    if (sweet.quantity < quantity) {
      return res.status(400).json({ message: `Insufficient stock for ${sweet.name}.` });
    }

    // Decrement stock
    sweet.quantity -= quantity;
    await sweet.save();

    // Record purchase
    const purchase = await Purchase.create({
      userId: req.user._id,
      sweetId: sweet._id,
      quantity,
      totalPrice: sweet.price * quantity,
    });

    res.json({
      success: true,
      purchaseId: purchase._id,
      sweet: mapSweet(sweet),
    });
  } catch (error) {
    console.error('Purchase Sweet Error:', error);
    res.status(500).json({ message: error.message || 'Server error processing purchase.' });
  }
});

// @desc    Restock a sweet (increments stock)
// @route   POST /api/sweets/:id/restock
// @access  Private/Admin
router.post('/:id/restock', authenticateUser, requireAdmin, async (req, res) => {
  const sweetId = req.params.id;
  const quantity = Number(req.body.quantity);

  if (isNaN(quantity) || quantity <= 0) {
    return res.status(400).json({ message: 'Invalid restock quantity.' });
  }

  try {
    const sweet = await Sweet.findById(sweetId);
    if (!sweet) {
      return res.status(404).json({ message: 'Sweet not found' });
    }

    sweet.quantity += quantity;
    await sweet.save();

    res.json({
      success: true,
      sweet: mapSweet(sweet),
    });
  } catch (error) {
    console.error('Restock Sweet Error:', error);
    res.status(500).json({ message: 'Server error restocking sweet.' });
  }
});

export default router;
