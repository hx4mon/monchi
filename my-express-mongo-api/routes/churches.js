const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Appending extension
  }
});

// Init upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // 1MB limit
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
}).single('image'); // 'image' is the field name from the frontend

// Check File Type
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only! (jpeg, jpg)');
  }
}

// Define the Church Schema (should match your migration script)
const churchSchema = new mongoose.Schema({
  id: { type: Number, unique: true, required: true },
  church_name: String,
  sec_registration_number: String,
  church_street_purok: String,
  church_barangay: String,
  church_town: String,
  denomination: String,
  no_of_years_in_existence: Number,
  facebook_messenger_account_name_of_church: String,
  church_contact_number: String,
  total_number_of_regular_attendees: Number,
  total_number_of_church_members: Number,
  total_number_of_assistant_pastor: Number,
  total_number_of_leaders: Number,
  tenure_status_of_the_church_building_lot: String,
  latitude: Number,
  longitude: Number,
  church_status: String,
  image_path: String, // Add image_path field
});

const Church = mongoose.model('Church', churchSchema);

// GET all churches
// Route: GET /api/churches/
router.get('/', async (req, res) => {
  try {
    const churches = await Church.find({ latitude: { $exists: true, $ne: null }, longitude: { $exists: true, $ne: null } });
    res.json(churches);
  } catch (err) {
    console.error('Error fetching churches:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST a new church
// Route: POST /api/churches/
router.post('/', (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ message: err });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    try {
      // Find the church with the highest ID to generate a new one
      const lastChurch = await Church.findOne().sort({ id: -1 });
      const newId = lastChurch ? lastChurch.id + 1 : 1;

      const newChurch = new Church({
        ...req.body,
        id: newId,
        image_path: `/uploads/${req.file.filename}`, // Save the path to the image
      });

      const savedChurch = await newChurch.save();
      res.status(201).json(savedChurch);
    } catch (error) {
      console.error('Error creating church:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
});

module.exports = router;
