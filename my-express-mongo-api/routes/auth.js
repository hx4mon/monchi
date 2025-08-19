const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

const jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    console.log('Auth.js: User object from DB:', user); // Add this line

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const userObject = user.toObject(); // Convert Mongoose document to plain object

    const token = jwt.sign({ id: userObject._id, role: userObject.role }, process.env.JWT_SECRET, { expiresIn: '4h' });

    const responseData = {
      message: 'Login successful',
      token: token,
      role: userObject.role
    };
    console.log('Auth.js: Sending user role:', userObject.role); // Log the role from the plain object
    res.status(200).json(responseData);

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;