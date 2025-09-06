import { Request, Response } from 'express';
import {User} from '../models/user'; // Adjust the path as needed

// Controller to fetch user by username or email from MongoDB
export const getUserBasicInfo = async (req: Request, res: Response) => {
    const { username, email } = req.query;

    try {
        let user;
        if (username) {
            user = await User.findOne({ username }).select("-password");
        } else if (email) {
            user = await User.findOne({ email }).select("-password");
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Return basic info
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
