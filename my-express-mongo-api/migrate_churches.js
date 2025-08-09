const mongoose = require('mongoose');
const fs = require('fs');
const { parse } = require('csv-parse');
const axios = require('axios');

// MongoDB Connection
const MONGODB_URI = 'mongodb://localhost:27017/mydatabase'; // Ensure this matches your index.js

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected for migration'))
  .catch(err => {
    console.error('MongoDB connection error during migration:', err);
    process.exit(1); // Exit if connection fails
  });

// Define the Church Schema
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
});

const Church = mongoose.model('Church', churchSchema);

// Google Maps Geocoding API Key (REPLACE WITH YOUR ACTUAL API KEY)
const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY'; 

async function geocodeAddress(address) {
  if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY') {
    console.warn('Google Maps API Key is not set. Skipping geocoding.');
    return { latitude: null, longitude: null };
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;
  try {
    const response = await axios.get(url);
    const data = response.data;

    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      console.log(`Geocoded ${address}: Lat ${location.lat}, Lng ${location.lng}`);
      return { latitude: location.lat, longitude: location.lng };
    } else {
      console.warn(`Geocoding failed for ${address}: ${data.status} - ${data.error_message || 'No results'}`);
      return { latitude: null, longitude: null };
    }
  } catch (error) {
    console.error(`Error geocoding address ${address}:`, error.message);
    return { latitude: null, longitude: null };
  }
}

async function migrateData() {
  const churchesData = [];
  const csvFilePath = '../church_data_manual.csv'; // Path to your CSV file

  if (!fs.existsSync(csvFilePath)) {
    console.error(`CSV file not found at ${csvFilePath}`);
    mongoose.connection.close();
    return;
  }

  console.log(`Reading data from ${csvFilePath}...`);
  fs.createReadStream(csvFilePath)
    .pipe(parse({ columns: true, skip_empty_lines: true }))
    .on('data', async (row) => {
      console.log('Processing row:', row); // Log each row being processed
      const fullAddress = `${row['CHURCH STREET/PUROK']}, ${row['CHURCH BARANGAY']}, ${row['CHURCH TOWN']}`;
      let latitude = parseFloat(row['LATITUDE']);
      let longitude = parseFloat(row['LONGTITUDE']);

      // Only geocode if lat/lng are not provided or are invalid
      if (isNaN(latitude) || isNaN(longitude) || latitude === 0 || longitude === 0) {
        console.log(`Geocoding address for ${row['CHURCH NAME']}: ${fullAddress}`);
        const geo = await geocodeAddress(fullAddress);
        latitude = geo.latitude;
        longitude = geo.longitude;
      } else {
        console.log(`Using existing Lat/Lng for ${row['CHURCH NAME']}: Lat ${latitude}, Lng ${longitude}`);
      }

      churchesData.push({
        id: churchesData.length + 1, // Simple ID generation, consider a more robust method for production
        church_name: row['CHURCH NAME'],
        sec_registration_number: row['SEC REGISTRATION NUMBER'],
        church_street_purok: row['CHURCH STREET/PUROK'],
        church_barangay: row['CHURCH BARANGAY'],
        church_town: row['CHURCH TOWN'],
        denomination: row['DENOMINATION'],
        no_of_years_in_existence: parseInt(row['NO. OF YEARS IN EXISTENCE']),
        facebook_messenger_account_name_of_church: row['FACEBOOK/MESSENGER ACCOUNT NAME OF CHURCH'],
        church_contact_number: row['CHURCH CONTACT NUMBER'],
        total_number_of_regular_attendees: parseInt(row['TOTAL NUMBER OF REGULAR ATTENDEES']),
        total_number_of_church_members: parseInt(row['TOTAL NUMBER OF CHURCH MEMBERS']),
        total_number_of_assistant_pastor: parseInt(row['TOTAL NUMBER OF ASSISTANT PASTOR']),
        total_number_of_leaders: parseInt(row['TOTAL NUMBER OF LEADERS']),
        tenure_status_of_the_church_building_lot: row['TENURE STATUS OF THE CHURCH BUILDING & LOT'],
        latitude: latitude,
        longitude: longitude,
        church_status: row['CHURCH STATUS'],
      });
    })
    .on('end', async () => {
      if (churchesData.length === 0) {
        console.log('No data parsed from CSV. Please check the CSV file and column headers.');
        mongoose.connection.close();
        return;
      }

      try {
        console.log(`Attempting to insert ${churchesData.length} church records...`);
        // Clear existing data before inserting new data (optional, but good for fresh migrations)
        // await Church.deleteMany({}); 
        // console.log('Cleared existing church data.');

        const result = await Church.insertMany(churchesData, { ordered: false });
        console.log(`Successfully inserted ${result.length} church records.`);
      } catch (error) {
        if (error.code === 11000) {
          console.warn('Duplicate key error (some records might already exist). Skipping duplicates.');
          console.log(`Successfully inserted ${error.result.insertedCount} new records.`);
        } else {
          console.error('Error during data migration:', error);
        }
      } finally {
        mongoose.connection.close();
        console.log('MongoDB connection closed.');
      }
    })
    .on('error', (err) => {
      console.error('Error reading CSV file:', err);
      mongoose.connection.close();
    });
}

migrateData();