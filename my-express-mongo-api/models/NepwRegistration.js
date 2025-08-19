const mongoose = require('mongoose');

const nepwRegistrationSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
    trim: true,
  },
  last_name: {
    type: String,
    required: true,
    trim: true,
  },
  middle_name: {
    type: String,
    trim: true,
  },
  name_extension: {
    type: String,
    trim: true,
  },
  church_street_purok: {
    type: String,
    trim: true,
  },
  church_barangay: {
    type: String,
    trim: true,
  },
  church_town: {
    type: String,
    trim: true,
  },
  church_contact_number: {
    type: String,
    trim: true,
  },
  birthday: {
    type: Date,
  },
  facebook_messenger_account_name_of_church: {
    type: String,
    trim: true,
  },
  selected_church_name: {
    type: String,
    trim: true,
  },
  designation: {
    type: String,
    trim: true,
  },
  other_church_name: {
    type: String,
    trim: true,
  },
  image: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    default: 'pending',
  },
}, { timestamps: true });

const NepwRegistration = mongoose.model('NepwRegistration', nepwRegistrationSchema);

module.exports = NepwRegistration;
