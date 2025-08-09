const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const monchiDataPath = path.join(__dirname, '..', '..', 'monchi.json');

// Helper function to read and parse the JSON data
const getMonchiData = () => {
  try {
    console.log('Attempting to read monchi.json from:', monchiDataPath);
    const data = fs.readFileSync(monchiDataPath, 'utf8');
    console.log('Successfully read monchi.json');
    const parsedData = JSON.parse(data);
    const brgyData = parsedData.find(item => item.name === 'brgy')?.data || [];
    const townData = parsedData.find(item => item.name === 'town')?.data || [];
    return { brgy: brgyData, town: townData };
  } catch (error) {
    console.error('Error reading or parsing monchi.json:', error);
    return { brgy: [], town: [] };
  }
};

// Route to get all towns
router.get('/towns', (req, res) => {
  const { town } = getMonchiData();
  res.json(town);
});

// Route to get barangays, optionally filtered by town_id
router.get('/barangays', (req, res) => {
  const { brgy } = getMonchiData();
  const { town_id } = req.query;

  if (town_id) {
    const filteredBrgy = brgy.filter(b => b.id_town === town_id);
    res.json(filteredBrgy);
  } else {
    res.json(brgy);
  }
});

module.exports = router;
