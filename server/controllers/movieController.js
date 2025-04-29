import Movie from '../models/Movie.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 1000000000 },
  fileFilter: (req, file, cb) => {
    console.log('File upload attempt:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });
    const filetypes = /mp4/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      console.log('File accepted:', file.originalname);
      return cb(null, true);
    } else {
      console.log('File rejected - not an MP4:', file.originalname);
      return cb(new Error('Only .mp4 files are allowed'));
    }
  }
}).single('file');

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
      return res.status(400).json({ message: err.message });
    }
    try {
      if (!req.file) {
        console.error('No file received in request');
        return res.status(400).json({ message: 'No file received' });
      }
      
      console.log('File uploaded successfully:', req.file);
      console.log('Creating movie document with title:', req.body.title);
      
      const movie = new Movie({ 
        title: req.body.title, 
        filename: req.file.filename 
      });
      
      console.log('Saving movie to database...');
      const savedMovie = await movie.save();
      console.log('Movie saved successfully:', savedMovie);
      
      res.status(201).json(savedMovie);
    } catch (error) {
      console.error('Error in upload process:', error);
      // If there's a database error, try to clean up the uploaded file
      if (req.file) {
        try {
          await fs.promises.unlink(req.file.path);
          console.log('Cleaned up uploaded file after database error');
        } catch (cleanupError) {
          console.error('Error cleaning up file:', cleanupError);
        }
      }
      res.status(500).json({ 
        message: 'Error uploading movie',
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
    res.json(movies);
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ 
      message: 'Error fetching movies',
      error: error.message 
    });
  }
};

export const handleDeleteMovie = async (req, res) => {
  try {
    console.log('Attempting to delete movie:', req.params.id);
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (movie) {
      console.log('Movie found and deleted from database');
      // Delete the file from uploads directory
      const filePath = path.join(__dirname, '..', 'uploads', movie.filename);
      try {
        await fs.promises.unlink(filePath);
        console.log('Movie file deleted from filesystem');
      } catch (err) {
        console.error('Error deleting file:', err);
      }
      res.json({ message: 'Movie deleted successfully' });
    } else {
      console.log('Movie not found for deletion');
      res.status(404).json({ message: 'Movie not found' });
    }
  } catch (error) {
    console.error('Error deleting movie:', error);
    res.status(500).json({ 
      message: 'Error deleting movie',
      error: error.message 
    });
  }
};
