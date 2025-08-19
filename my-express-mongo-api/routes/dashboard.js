const express = require('express');
const router = express.Router();
const NepwRegistration = require('../models/NepwRegistration'); // Import NepwRegistration model

router.get('/member-distribution', async (req, res) => {
  try {
    const memberDistribution = await NepwRegistration.aggregate([
      {
        $group: {
          _id: '$church_town',
          members: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          members: 1
        }
      },
      {
        $sort: { members: -1 } // Sort by member count descending
      }
    ]);
    res.json(memberDistribution);
  } catch (error) {
    console.error('Error fetching member distribution:', error);
    res.status(500).json({ message: 'Failed to fetch member distribution' });
  }
});

module.exports = router;
