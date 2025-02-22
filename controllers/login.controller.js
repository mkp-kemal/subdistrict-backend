import bcrypt from 'bcryptjs';
import generateTokenAndSetCookie from '../helper/generateTokenAndSetCookie.js';
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'username atau password salah!' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        await User.findByIdAndUpdate(user._id, { token });

        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: 'Error logging in' });
        console.error('Error logging in:', err.message);
    }
};

export const logout = async (req, res) => {
    const authorization = req.headers.authorization;
    if (!authorization) return res.status(401).json({ message: 'Unauthorized' });

    const userId = req.userId;
    console.log('User ID:', userId);

    try {
        await User.findByIdAndUpdate(userId, { token: "-" });

        res.status(200).json({ message: 'Logout successful' });
    } catch (err) {
        res.status(500).json({ message: 'Error logging out' });
        console.error('Error logging out:', err.message);
    }
};

export const user = async (req, res) => {
    const userId = req.userId;
    try {
        const user = await User.findOne({ _id: userId, token: { $ne: '-' } }, 'email username');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Error getting user' });
        console.error('Error getting user:', err.message);
    }
};

export const users = async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mendapatkan data users', error: error.message });
    }
};
