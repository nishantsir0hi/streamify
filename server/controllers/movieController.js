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

const thumbnailStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'thumb-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  console.log('Processing file:', {
    fieldname: file.fieldname,
    originalname: file.originalname,
    mimetype: file.mimetype
  });

  if (file.fieldname === 'file') {
    // Video file validation
    const videoTypes = /\.(mp4|mov|avi|mkv)$/i;
    const isValidExt = videoTypes.test(path.extname(file.originalname).toLowerCase());
    const isValidMime = /^video\//.test(file.mimetype);

    if (isValidExt && isValidMime) {
      console.log('Video file accepted:', file.originalname);
      cb(null, true);
    } else {
      console.log('Video file rejected:', {
        filename: file.originalname,
        reason: !isValidExt ? 'Invalid file extension' : 'Invalid MIME type'
      });
      cb(new Error('Only video files (MP4, MOV, AVI, MKV) are allowed'));
    }
  } else if (file.fieldname === 'thumbnail') {
    // Image file validation
    const imageTypes = /\.(jpg|jpeg|png|webp)$/i;
    const isValidExt = imageTypes.test(path.extname(file.originalname).toLowerCase());
    const isValidMime = /^image\/(jpeg|png|webp)$/.test(file.mimetype);

    if (isValidExt && isValidMime) {
      console.log('Thumbnail accepted:', {
        filename: file.originalname,
        mimetype: file.mimetype
      });
      cb(null, true);
    } else {
      console.log('Thumbnail rejected:', {
        filename: file.originalname,
        mimetype: file.mimetype,
        reason: !isValidExt ? 'Invalid file extension' : 'Invalid MIME type'
      });
      cb(new Error('Only image files (JPG, JPEG, PNG, WEBP) are allowed'));
    }
  } else {
    cb(new Error('Invalid field name'));
  }
};

const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 2000000000, // 2GB for video
    files: 2 // Allow both video and thumbnail
  },
  fileFilter: fileFilter
}).fields([
  { name: 'file', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]);

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
    files: req.files ? {
      video: req.files.file ? {
        filename: req.files.file[0].filename,
        path: req.files.file[0].path,
        size: req.files.file[0].size,
        mimetype: req.files.file[0].mimetype,
        originalname: req.files.file[0].originalname
      } : 'No video file',
      thumbnail: req.files.thumbnail ? {
        filename: req.files.thumbnail[0].filename,
        path: req.files.thumbnail[0].path,
        size: req.files.thumbnail[0].size,
        mimetype: req.files.thumbnail[0].mimetype,
        originalname: req.files.thumbnail[0].originalname
      } : 'No thumbnail file'
    } : 'No files',
    headers: {
      'content-type': req.headers['content-type'],
      'content-length': req.headers['content-length']
    }
  });
  
  upload(req, res, async (err) => {
    if (err) {
      console.error('Upload error:', {
        message: err.message,
        code: err.code,
        field: err.field,
        stack: err.stack,
        headers: req.headers
      });
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
      if (!req.files || !req.files.file || !req.files.thumbnail) {
        console.error('Missing required files:', {
          hasFiles: !!req.files,
          hasVideo: req.files?.file ? true : false,
          hasThumbnail: req.files?.thumbnail ? true : false,
          receivedFields: Object.keys(req.files || {}),
          contentType: req.headers['content-type']
        });
        return res.status(400).json({ 
          message: 'Both video and thumbnail files are required',
          error: 'MISSING_FILES',
          details: {
            hasFiles: !!req.files,
            hasVideo: req.files?.file ? true : false,
            hasThumbnail: req.files?.thumbnail ? true : false
          }
        });
      }

      if (!req.body.title || req.body.title.trim() === '') {
        // Clean up the uploaded files if title is missing
        if (req.files.file) {
          await fs.promises.unlink(req.files.file[0].path);
          console.log('Cleaned up video file due to missing title');
        }
        if (req.files.thumbnail) {
          await fs.promises.unlink(req.files.thumbnail[0].path);
          console.log('Cleaned up thumbnail file due to missing title');
        }
        return res.status(400).json({ message: 'Movie title is required' });
      }

      console.log('Files uploaded successfully:', {
        video: {
          filename: req.files.file[0].filename,
          size: req.files.file[0].size,
          mimetype: req.files.file[0].mimetype
        },
        thumbnail: {
          filename: req.files.thumbnail[0].filename,
          size: req.files.thumbnail[0].size,
          mimetype: req.files.thumbnail[0].mimetype
        }
      });
      
      console.log('Creating movie document with:', {
        title: req.body.title.trim(),
        videoFilename: req.files.file[0].filename,
        thumbnailFilename: req.files.thumbnail[0].filename
      });
      
      const movie = new Movie({ 
        title: req.body.title.trim(), 
        filename: req.files.file[0].filename,
        thumbnail: req.files.thumbnail[0].filename,
        originalName: req.files.file[0].originalname,
        size: req.files.file[0].size,
        mimeType: req.files.file[0].mimetype
      });
      
      console.log('Saving movie to database...');
      const savedMovie = await movie.save();
      console.log('Movie saved successfully:', {
        id: savedMovie._id,
        title: savedMovie.title,
        filename: savedMovie.filename,
        thumbnail: savedMovie.thumbnail
      });
      
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://streamify-2.onrender.com' 
        : 'http://localhost:5001';

      const response = {
        ...savedMovie.toObject(),
        url: `${baseUrl}/uploads/${savedMovie.filename}`,
        thumbnailUrl: `${baseUrl}/uploads/${savedMovie.thumbnail}`
      };
      
      console.log('Sending response:', {
        id: response._id,
        title: response.title,
        url: response.url,
        thumbnailUrl: response.thumbnailUrl
      });

      res.status(201).json(response);
    } catch (error) {
      console.error('Error in upload process:', {
        error: error.message,
        stack: error.stack,
        files: req.files ? {
          hasVideo: !!req.files.file,
          hasThumbnail: !!req.files.thumbnail
        } : 'No files'
      });
      
      // Clean up any uploaded files if there's an error
      if (req.files) {
        try {
          if (req.files.file) {
            await fs.promises.unlink(req.files.file[0].path);
            console.log('Cleaned up video file after error');
          }
          if (req.files.thumbnail) {
            await fs.promises.unlink(req.files.thumbnail[0].path);
            console.log('Cleaned up thumbnail file after error');
          }
        } catch (unlinkError) {
          console.error('Error cleaning up files:', unlinkError);
        }
      }
      res.status(500).json({ 
        message: 'Error processing upload',
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
    const baseUrl = 'https://streamify-2.onrender.com';
    
    const moviesWithUrls = movies.map(movie => {
      const url = `${baseUrl}/uploads/${movie.filename}`;
      const thumbnailUrl = `${baseUrl}/uploads/${movie.thumbnail}`;
      console.log('Generated URLs for movie:', { 
        title: movie.title, 
        url, 
        thumbnailUrl,
        filename: movie.filename,
        thumbnail: movie.thumbnail
      });
      return {
        ...movie.toObject(),
        url,
        thumbnailUrl
      };
    });
    
    console.log('Sending response with movies:', moviesWithUrls.map(m => ({
      title: m.title,
      url: m.url,
      thumbnailUrl: m.thumbnailUrl
    })));
    
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
      console.log('Movie not found:', req.params.id);
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Delete the video file from the uploads directory
    const videoPath = path.join(uploadsDir, movie.filename);
    const thumbnailPath = path.join(uploadsDir, movie.thumbnail);
    
    try {
      if (fs.existsSync(videoPath)) {
        await fs.promises.unlink(videoPath);
        console.log('Deleted video file:', videoPath);
      } else {
        console.warn('Video file not found:', videoPath);
      }

      if (fs.existsSync(thumbnailPath)) {
        await fs.promises.unlink(thumbnailPath);
        console.log('Deleted thumbnail file:', thumbnailPath);
      } else {
        console.warn('Thumbnail file not found:', thumbnailPath);
      }
    } catch (fileError) {
      console.error('Error deleting files:', fileError);
      // Continue with database deletion even if file deletion fails
    }

    // Delete the movie from the database
    await Movie.findByIdAndDelete(req.params.id);
    console.log('Movie deleted from database:', req.params.id);
    
    res.json({ 
      message: 'Movie deleted successfully',
      details: {
        id: req.params.id,
        title: movie.title
      }
    });
  } catch (error) {
    console.error('Error deleting movie:', {
      id: req.params.id,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      message: 'Error deleting movie',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};
