const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Define the User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// POST a new user (Registration)
// Route: POST /api/users/
router.post('/', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Basic validation
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const newUser = new User({
      username,
      password, // In a real application, you would hash this password!
    });

    const savedUser = await newUser.save();
    res.status(201).json({ message: 'User registered successfully', user: savedUser });
  } catch (err) {
    if (err.code === 11000) { // Duplicate key error (username unique constraint)
      return res.status(409).json({ message: 'Username already exists' });
    }
    console.error('Error registering user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET all users (for demonstration purposes - would be protected in a real app)
// Route: GET /api/users/
router.get('/', async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
