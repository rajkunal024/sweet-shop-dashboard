import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Sweet from '../models/Sweet.js';
import Purchase from '../models/Purchase.js';

dotenv.config();

const initialSweets = [
  {
    name: 'Gourmet Chocolate Truffles',
    category: 'Chocolate',
    price: 499.00,
    quantity: 45,
    description: 'An assortment of premium dark, milk, and white chocolate truffles crafted by master chocolatiers.',
    imageUrl: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Artisanal Sea Salt Caramels',
    category: 'Candy',
    price: 299.00,
    quantity: 60,
    description: 'Rich, chewy caramels sprinkled with hand-harvested sea salt.',
    imageUrl: 'https://images.unsplash.com/photo-1581798459219-318e76aecc7b?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'French Macaron Box',
    category: 'Pastry',
    price: 699.00,
    quantity: 25,
    description: 'Elegant Parisian macarons in pistachio, raspberry, vanilla, and chocolate flavors.',
    imageUrl: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Belgian Waffles with Syrup',
    category: 'Pastry',
    price: 349.00,
    quantity: 30,
    description: 'Light and fluffy Belgian waffles served with organic maple syrup.',
    imageUrl: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Double Chocolate Fudge Cookies',
    category: 'Cookies',
    price: 199.00,
    quantity: 80,
    description: 'Soft-baked cookies loaded with rich cocoa and semi-sweet chocolate chips.',
    imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Classic Red Velvet Cake Slice',
    category: 'Cakes',
    price: 249.00,
    quantity: 15,
    description: 'Moist red velvet cake layers with smooth, velvety cream cheese frosting.',
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Sour Fruit Gummies',
    category: 'Gummies',
    price: 149.00,
    quantity: 120,
    description: 'Tangy and sweet gummy candies in a variety of delicious fruit shapes and flavors.',
    imageUrl: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Wild Berry Sorbet',
    category: 'Ice Cream',
    price: 399.00,
    quantity: 8,
    description: 'A refreshing, dairy-free frozen treat made with ripe raspberries, blackberries, and strawberries.',
    imageUrl: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Old-Fashioned Hard Candies',
    category: 'Hard Candy',
    price: 99.00,
    quantity: 0,
    description: 'Traditional hard-boiled candies in peppermint, butterscotch, and lemon.',
    imageUrl: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Premium Kaju Katli Box',
    category: 'Indian Sweets',
    price: 799.00,
    quantity: 50,
    description: 'Delectable Indian cashew fudge sweets adorned with delicate silver leaf (varq).',
    imageUrl: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Spiced Gulab Jamun Jar',
    category: 'Indian Sweets',
    price: 349.00,
    quantity: 40,
    description: 'Soft milk-solid dumplings fried golden and soaked in a warm, fragrant rose and cardamom syrup.',
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
  }
];

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI not specified in environment variables.');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    // Clear existing data
    console.log('Clearing existing collections...');
    await User.deleteMany({});
    await Sweet.deleteMany({});
    await Purchase.deleteMany({});
    console.log('Collections cleared.');

    // Create admin user
    console.log('Seeding default administrator...');
    const adminUser = await User.create({
      email: 'admin@sweetshop.com',
      password: 'admin123',
      fullName: 'Shop Administrator',
      role: 'admin',
    });
    console.log(`Default administrator user created (email: admin@sweetshop.com, password: admin123).`);

    // Create a regular user for testing
    console.log('Seeding a test customer...');
    await User.create({
      email: 'customer@sweetshop.com',
      password: 'customer123',
      fullName: 'Alice Johnson',
      role: 'user',
    });
    console.log(`Default customer user created (email: customer@sweetshop.com, password: customer123).`);

    // Create sweets
    console.log('Seeding sweets inventory...');
    const seededSweets = await Sweet.insertMany(initialSweets);
    console.log(`Successfully seeded ${seededSweets.length} sweets.`);

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
