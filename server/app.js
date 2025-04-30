import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import movieRoutes from './routes/movieRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { authenticateToken } from './middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();

// Configure CORS
app.use(cors({
  origin: ['http://localhost:5173', 'https://streamify-xi-blue.vercel.app', 'https://streamify-2.onrender.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Range', 'Accept', 'Content-Length', 'Content-Range'],
  exposedHeaders: ['Content-Range', 'Content-Length', 'Content-Type', 'Accept-Ranges'],
  credentials: true,
  maxAge: 86400 // 24 hours
}));

// Increase payload size limit for file uploads
app.use(express.json({ limit: '1000mb' }));
app.use(express.urlencoded({ limit: '1000mb', extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res, path) => {
    // Set CORS headers for static files
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, HEAD');
    res.set('Access-Control-Allow-Headers', 'Range, Content-Range');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);

// Protected routes
app.use('/api/admin', authenticateToken, (req, res, next) => {
  // Add admin-specific routes here
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    code: err.code,
    path: req.path,
    method: req.method,
    body: req.body,
    files: req.files,
    headers: req.headers,
    query: req.query,
    params: req.params,
    timestamp: new Date().toISOString()
  });
  
  // Handle specific error types
  if (err.name === 'MulterError') {
    return res.status(400).json({
      error: 'File Upload Error',
      message: err.message,
      code: err.code,
      field: err.field
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message,
      details: err.errors
    });
  }

  if (err.name === 'MongoError') {
    return res.status(500).json({
      error: 'Database Error',
      message: 'An error occurred while accessing the database',
      code: err.code
    });
  }

  // Default error response
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message,
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
