import jwt from 'jsonwebtoken';

const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            return next();
        } catch (error) {
            return res.status(401).json({ message: 'Invalid token' });
        }
    }

    res.status(401).json({ message: 'No token provided' });
};

export default protect;
