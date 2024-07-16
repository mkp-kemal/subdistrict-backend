import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  publisher: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true,
  versionKey: false
});

const BlogData = mongoose.model('blogs', blogSchema);

export default BlogData;
