const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const https = require('https'); // Import https module
const fs = require('fs'); // Import fs module
const path = require('path'); // Import path module
const multer = require('multer'); // Import multer

require('dotenv').config();

const helmet = require('helmet');

const app = express();

// Serve static files from the 'uploads' directory first
const uploadsPath = path.join(__dirname, 'uploads');
console.log('Express serving static files from:', uploadsPath);
app.use('/uploads', express.static(uploadsPath));

const PORT = process.env.PORT || 5000;

// Load SSL certificates
const privateKey = fs.readFileSync(path.join(__dirname, 'certs', 'key.pem'), 'utf8');
const certificate = fs.readFileSync(path.join(__dirname, 'certs', 'cert.pem'), 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Middleware
app.use(helmet());
const corsOptions = {
  origin: ['https://localhost:3000', 'https://localhost:5173', 'https://127.0.0.1:5173', 'https://100.25.0.4:5173'], // Allow Vite dev servers and your machine's IP
  optionsSuccessStatus: 200 // For legacy browser support
}
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Files will be stored in the 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});
const upload = multer({ storage: storage });



// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected for Express API'))
  .catch(err => {
    console.error('MongoDB connection error for Express API:', err);
    process.exit(1);
  });

// API Routes
const churchRoutes = require('./routes/churches');
const userRoutes = require('./routes/users');
const locationRoutes = require('./routes/locations');
const nepwRegistrationRoutes = require('./routes/nepwRegistrations')(upload);
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard'); // New: Import dashboard routes
const authMiddleware = require('./middleware/authMiddleware');
app.use('/api/churches', authMiddleware, churchRoutes);
app.use('/api/users', userRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/nepw-registrations', authMiddleware, nepwRegistrationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes); // New: Integrate dashboard routes with auth middleware

// Root route
app.get('/', (req, res) => {
  res.json({
    message: "This api is made by Raymund Cruz Espanto and Del Noel Duran for MIS-SOL. and for the purpose for the application of you know what made for you know who"
  });
});

// Create HTTPS server
const httpsServer = https.createServer(credentials, app);

// Start the server
httpsServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Express API server running on https://0.0.0.0:${PORT}`);
});