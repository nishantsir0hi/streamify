import Movie from '../models/Movie.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 2000000000, // 2GB
    files: 2 // Allow both video and thumbnail
  },
  fileFilter: (req, file, cb) => {
    console.log('File upload attempt:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      fieldname: file.fieldname
    });

    if (file.fieldname === 'file') {
      // Check video file
      const filetypes = /\.(mp4|mov|avi|mkv)$/i;
      const extname = filetypes.test(path.extname(file.originalname));
      const mimetype = /^video\//.test(file.mimetype);

      if (extname && mimetype) {
        console.log('Video file accepted:', file.originalname);
        return cb(null, true);
      } else {
        console.log('Video file rejected:', {
          filename: file.originalname,
          reason: !extname ? 'Invalid file extension' : 'Invalid MIME type'
        });
        return cb(new Error('Only video files (MP4, MOV, AVI, MKV) are allowed'));
      }
    } else if (file.fieldname === 'thumbnail') {
      // Check thumbnail file
      const filetypes = /\.(jpg|jpeg|png|webp)$/i;
      const extname = filetypes.test(path.extname(file.originalname));
      const mimetype = /^image\//.test(file.mimetype);

      if (extname && mimetype) {
        console.log('Thumbnail file accepted:', file.originalname);
        return cb(null, true);
      } else {
        console.log('Thumbnail file rejected:', {
          filename: file.originalname,
          reason: !extname ? 'Invalid file extension' : 'Invalid MIME type'
        });
        return cb(new Error('Only image files (JPG, JPEG, PNG, WEBP) are allowed'));
      }
    } else {
      return cb(new Error('Invalid field name'));
    }
  }
}).fields([
  { name: 'file', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]);

const thumbnailStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'thumb-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadThumbnail = multer({
  storage: thumbnailStorage,
  limits: {
    fileSize: 5000000, // 5MB
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /\.(jpg|jpeg|png|webp)$/i;
    const extname = filetypes.test(path.extname(file.originalname));
    const mimetype = /^image\//.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      return cb(new Error('Only image files (JPG, JPEG, PNG, WEBP) are allowed'));
    }
  }
}).single('thumbnail');

export const uploadMovie = (req, res) => {
  console.log('Upload request received:', {
    body: req.body,
    file: req.file ? {
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size
    } : 'No file'
  });
  
  upload(req, res, async (err) => {
    if (err) {
      console.error('Upload error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          message: 'File size too large. Maximum size is 2GB',
          error: err.message 
        });
      }
      return res.status(400).json({ 
        message: err.message || 'Error uploading file',
        error: err.message 
      });
    }

    try {
      if (!req.file) {
        console.error('No file received in request');
        return res.status(400).json({ message: 'No file received' });
      }

      if (!req.body.title || req.body.title.trim() === '') {
        // Clean up the uploaded file if title is missing
        await fs.promises.unlink(req.file.path);
        return res.status(400).json({ message: 'Movie title is required' });
      }

      // Handle thumbnail upload
      uploadThumbnail(req, res, async (thumbErr) => {
        if (thumbErr) {
          // Clean up the video file if thumbnail upload fails
          await fs.promises.unlink(req.file.path);
          return res.status(400).json({ 
            message: 'Error uploading thumbnail',
            error: thumbErr.message 
          });
        }

        if (!req.file) {
          // Clean up the video file if no thumbnail is provided
          await fs.promises.unlink(req.file.path);
          return res.status(400).json({ message: 'Thumbnail is required' });
        }
      
        console.log('File uploaded successfully:', req.file);
        console.log('Creating movie document with title:', req.body.title);
        
        const movie = new Movie({ 
          title: req.body.title.trim(), 
          filename: req.file.filename,
          thumbnail: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          mimeType: req.file.mimetype
        });
        
        console.log('Saving movie to database...');
        const savedMovie = await movie.save();
        console.log('Movie saved successfully:', savedMovie);
        
        res.status(201).json({
          ...savedMovie.toObject(),
          url: `/uploads/${savedMovie.filename}`,
          thumbnailUrl: `/uploads/${savedMovie.thumbnail}`
        });
      });
    } catch (error) {
      console.error('Error in upload process:', error);
      // Clean up any uploaded files if there's an error
      if (req.file) {
        try {
          await fs.promises.unlink(req.file.path);
        } catch (unlinkError) {
          console.error('Error cleaning up file:', unlinkError);
        }
      }
      res.status(500).json({ 
        message: 'Error processing upload',
        error: error.message 
      });
    }
  });
};

export const getMovies = async (req, res) => {
  try {
    console.log('Fetching movies from database...');
    const movies = await Movie.find().sort({ createdAt: -1 });
    console.log(`Found ${movies.length} movies`);
    
    // Add full URLs to the response
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://streamify-2.onrender.com' 
      : 'http://localhost:5001';
    
    const moviesWithUrls = movies.map(movie => {
      const url = `${baseUrl}/uploads/${movie.filename}`;
      const thumbnailUrl = `${baseUrl}/uploads/${movie.thumbnail}`;
      console.log('Generated URLs for movie:', { title: movie.title, url, thumbnailUrl });
      return {
        ...movie.toObject(),
        url,
        thumbnailUrl
      };
    });
    
    res.json(moviesWithUrls);
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ 
      message: 'Error fetching movies',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const handleDeleteMovie = async (req, res) => {
  try {
    console.log('Attempting to delete movie:', req.params.id);
    const movie = await Movie.findById(req.params.id);
    
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Delete the file from the uploads directory
    const filePath = path.join(uploadsDir, movie.filename);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      console.log('Deleted file:', filePath);
    }

    // Delete the movie from the database
    await Movie.findByIdAndDelete(req.params.id);
    console.log('Movie deleted from database');
    
    res.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    console.error('Error deleting movie:', error);
    res.status(500).json({ 
      message: 'Error deleting movie',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
