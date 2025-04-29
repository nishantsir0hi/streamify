import express from 'express';
import { uploadMovie, getMovies, handleDeleteMovie } from '../controllers/movieController.js';

const router = express.Router();

router.post('/upload', uploadMovie);
router.get('/', getMovies);
router.delete('/:id', handleDeleteMovie);

export default router;
