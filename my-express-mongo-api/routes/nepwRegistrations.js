module.exports = (upload) => {
  const express = require('express');
  const router = express.Router();
  const mongoose = require('mongoose');
  const path = require('path'); // Import path module
  const NepwRegistration = require('../models/NepwRegistration'); // Import the NepwRegistration model

  // Remove internal schema definition
  /*
  const nepwRegistrationSchema = new mongoose.Schema({
    first_name: { type: String, required: true }, // First Name
    middle_name: { type: String }, // Middle Name
    last_name: { type: String }, // Last Name
    name_extension: { type: String }, // Name Extension
    church_street_purok: { type: String }, // Middle Name
    church_barangay: { type: String },
    church_town: { type: String },
    facebook_messenger_account_name_of_church: { type: String }, // Birthday
    church_contact_number: { type: String }, // Contact Number
    selected_church_name: { type: String }, // Selected Church
    designation: { type: String }, // Designation
    other_church_name: { type: String }, // Other Church Name (if applicable)
    image: { type: String }, // Path to uploaded image
    status: { type: String, default: 'pending' }, // Approval status
    createdAt: { type: Date, default: Date.now },
  });

  const NepwRegistration = mongoose.model('NepwRegistration', nepwRegistrationSchema);
  */

  // POST /api/nepw-registrations - Create a new NEPW registration
  router.post('/', upload.single('image'), async (req, res) => {
    try {
      const { 
        first_name, 
        middle_name, 
        last_name, 
        name_extension, 
        church_street_purok, 
        church_barangay, 
        church_town, 
        facebook_messenger_account_name_of_church, 
        church_contact_number, 
        selected_church_name, 
        designation, 
        other_church_name,
        status,
        birthday // Added birthday
      } = req.body;

      const imagePath = req.file ? req.file.filename : ''; // Get filename if image was uploaded

      const newRegistration = new NepwRegistration({
        first_name,
        middle_name,
        last_name,
        name_extension,
        church_street_purok,
        church_barangay,
        church_town,
        facebook_messenger_account_name_of_church,
        church_contact_number,
        selected_church_name,
        designation,
        other_church_name,
        image: imagePath,
        status: status || 'pending',
        birthday, // Added birthday
      });

      const savedRegistration = await newRegistration.save();
      res.status(201).json({ message: 'NEPW registration received and saved', data: savedRegistration });
    } catch (error) {
      console.error('Error saving NEPW registration:', error);
      res.status(500).json({ message: 'Failed to save NEPW registration' });
    }
  });

  // GET /api/nepw-registrations - Get NEPW registrations by status
  router.get('/', async (req, res) => {
    try {
      const { status } = req.query;
      let filter = {}; // Initialize filter

      if (status === 'all') {
        filter = {}; // No filter, get all
      } else if (status) {
        filter = { status }; // Filter by provided status
      } else {
        filter = { status: 'pending' }; // Default to pending
      }

      
      const registrations = await NepwRegistration.find(filter);
      res.status(200).json(registrations);
    } catch (error) {
      console.error('Error fetching NEPW registrations:', error);
      res.status(500).json({ message: 'Failed to fetch NEPW registrations' });
    }
  });

  // PATCH /api/nepw-registrations/:id/approve - Approve a NEPW registration
  router.patch('/:id/approve', async (req, res) => {
    try {
      const { id } = req.params;
      const updatedRegistration = await NepwRegistration.findByIdAndUpdate(id, { status: 'approved' }, { new: true });
      if (!updatedRegistration) {
        return res.status(404).json({ message: 'Registration not found' });
      }
      res.status(200).json({ message: `Registration ${id} approved`, data: updatedRegistration });
    } catch (error) {
      console.error('Error approving registration:', error);
      res.status(500).json({ message: 'Failed to approve registration' });
    }
  });

  // PATCH /api/nepw-registrations/:id/reject - Reject a NEPW registration
  router.patch('/:id/reject', async (req, res) => {
    try {
      const { id } = req.params;
      const updatedRegistration = await NepwRegistration.findByIdAndUpdate(id, { status: 'rejected' }, { new: true });
      if (!updatedRegistration) {
        return res.status(404).json({ message: 'Registration not found' });
      }
      res.status(200).json({ message: `Registration ${id} rejected`, data: updatedRegistration });
    } catch (error) {
      console.error('Error rejecting registration:', error);
      res.status(500).json({ message: 'Failed to reject registration' });
    }
  });

  return router;
};
