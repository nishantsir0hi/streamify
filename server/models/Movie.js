import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  filename: {
    type: String,
    required: true,
    unique: true
  },
  thumbnail: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /\.(jpg|jpeg|png|webp)$/i.test(v);
      },
      message: props => `${props.value} is not a valid image file. Only jpg, jpeg, png, and webp are allowed.`
    }
  },
  originalName: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add index for faster queries
movieSchema.index({ createdAt: -1 });
movieSchema.index({ title: 'text' });

const Movie = mongoose.model('Movie', movieSchema);

export default Movie;
