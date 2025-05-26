
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/UserModel.js';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

export const register_user = async (req, res) => {
    try {
        console.log(req.body,'body ')
        const { name, username, email, password } = req.body;

        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            console.log('userexists')
            return res.status(400).json({ message: 'Email or username already taken' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            username,
            email,
            password: hashedPassword
        });

        res.status(201).json({
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email
            },
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export const login_user = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        res.status(200).json({
            user: { id: user._id, email: user.email },
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
