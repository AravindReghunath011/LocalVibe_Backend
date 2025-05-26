import express from 'express';
import dotenv from 'dotenv';
import connectDB from './configs/mongo.js';
import authRoutes from './routes/authRoutes.js'
import postRoutes from './routes/postRoutes.js'
import cors from 'cors'

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors())

// DB Connection
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
