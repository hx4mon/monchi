const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('MongoDB connected for seeding users.');

    // Clear existing users before seeding
    await User.deleteMany({});
    console.log('All existing users cleared.');

    const usersToSeed = [
      { username: 'admin', password: 'password', role: 'admin' },
      { username: 'encoder', password: 'encoder', role: 'encoder' },
      { username: 'user', password: 'user', role: 'user' },
    ];

    for (const userData of usersToSeed) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = new User({
        username: userData.username,
        password: hashedPassword,
        role: userData.role,
      });

      try {
        await user.save();
        console.log(`User ${userData.username} seeded successfully.`);
      } catch (error) {
        if (error.code === 11000) {
          console.warn(`User ${userData.username} already exists. Skipping.`);
        } else {
          console.error(`Error seeding user ${userData.username}:`, error);
        }
      }
    }

    mongoose.disconnect();
    console.log('MongoDB disconnected.');
  })
  .catch(err => {
    console.error('MongoDB connection error for seeding:', err);
    process.exit(1);
  });
