import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './db/connectDB.js';
import userRoutes from './routes/userRoutes.js';
import multer from 'multer';  // Pastikan multer diimpor di sini

// Konfigurasi .env
dotenv.config();

// Koneksi ke database
connectDB();

const app = express();

const PORT = process.env.PORT;

app.use(cors({
  origin: 'http://localhost:5173',
  methods: 'GET,POST,PUT,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type,Authorization'
}));

// Middleware parsing JSON body
app.use(express.json());

// Middleware parsing URL-encoded data
app.use(express.urlencoded({ extended: true }));

// ROUTES
app.use(process.env.API_ROUTES, userRoutes);

// Middleware error handling dari multerConfig
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ message: 'File tidak boleh melebihi 5MB' });
    } else {
      res.status(400).json({ message: err.message });
    }
  } else if (err) {
    res.status(500).json({ message: err.message });
  } else {
    next();
  }
});

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
