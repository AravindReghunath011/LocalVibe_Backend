import express from 'express';
import { login_user, register_user } from '../controllers/authController';
import protect from '../middlewares/auth';

const router = express.Router();

router.post('/register', register_user);
router.post('/login', login_user);

// Protected route example
router.get('/me', protect, (req, res) => {
    res.json({ message: 'You are authorized', user: req.user });
});

export default router;
