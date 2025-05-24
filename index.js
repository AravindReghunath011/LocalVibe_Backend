import express from 'express';
import dotenv from 'dotenv';
import connectDB from './configs/mongo';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// DB Connection
connectDB();

// Routes
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
