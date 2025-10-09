import { Request, Response } from 'express';
import { UserInfo } from '../models/userInfo';

// Get current user's info
export const getUserInfo = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'Unauthorized: User not found in request' });
    }

    const userInfo = await UserInfo.findOne({ user: req.user._id })
      .populate('user', 'email username');

    if (!userInfo) {
      return res.status(200).json({ 
        success: true, 
        data: {
          user: req.user._id,
          fullName: '',
          bio: '',
          location: '',
          email: '',
          phone: '',
          portfolio: '',
          institute: '',
          graduationYear: null,
          links: {
            github: '',
            linkedin: '',
            twitter: '',
            instagram: '',
            leetcode: '',
            codeforces: '',
            codechef: '',
            gfg: '',
            hackerrank: '',
            code360: ''
          },
          skills: [],
          experience: {
            years: 0,
            currentRole: '',
            company: ''
          }
        }
      });
    }
    
    res.status(200).json({ success: true, data: userInfo });
  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get user info by userId
export const getUserInfoById = async (req: Request, res: Response) => {
  try {
    const userInfo = await UserInfo.findOne({ user: req.params.userId })
      .populate('user', 'email username');

    if (!userInfo) {
      return res.status(404).json({ success: false, message: 'Please complete your profile links first.' });
    }
   
    res.status(200).json({ success: true, data: userInfo });
  } catch (error) {
    console.error('❌ Error fetching user info:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create new user info
export const createUserInfo = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'Unauthorized: User not found in request' });
    }
    const userId = req.user._id;

    const existingUserInfo = await UserInfo.findOne({ user: userId });

    if (existingUserInfo) {
      return res.status(403).json({ 
        success: false, 
        message: 'User info already created. Use PUT request to update.' 
      });
    }

    const { 
      fullName, 
      bio, 
      location, 
      email,
      phone,
      portfolio,
      institute,
      graduationYear,
      links, 
      skills, 
      experience 
    } = req.body;
    
    const userInfo = new UserInfo({
      user: userId,
      fullName,
      bio,
      location,
      email,
      phone,
      portfolio,
      institute,
      graduationYear,
      links,
      skills,
      experience
    });
    
    await userInfo.save();
    await userInfo.populate('user', 'email username');
    
    res.status(201).json({ success: true, data: userInfo });
  } catch (error) {
    console.error('Error creating user info:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update user info (full update or create if doesn't exist)
export const updateUserInfo = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'Unauthorized: User not found in request' });
    }
    const userId = req.user._id;

    let userInfo = await UserInfo.findOne({ user: userId });
    
    if (userInfo) {
      const existingData = userInfo.toObject();
      const updates = req.body;
      
      const mergedData: any = {};
      
      if (updates.fullName !== undefined) mergedData.fullName = updates.fullName;
      if (updates.bio !== undefined) mergedData.bio = updates.bio;
      if (updates.location !== undefined) mergedData.location = updates.location;
      if (updates.email !== undefined) mergedData.email = updates.email;
      if (updates.phone !== undefined) mergedData.phone = updates.phone;
      if (updates.portfolio !== undefined) mergedData.portfolio = updates.portfolio;
      if (updates.institute !== undefined) mergedData.institute = updates.institute;
      if (updates.graduationYear !== undefined) mergedData.graduationYear = updates.graduationYear;
      if (updates.skills !== undefined) mergedData.skills = updates.skills;
      
      if (updates.links) {
        mergedData.links = { ...existingData.links, ...updates.links };
      }
      
      if (updates.experience) {
        mergedData.experience = { ...existingData.experience, ...updates.experience };
      }
      
      userInfo = await UserInfo.findOneAndUpdate(
        { user: userId },
        { $set: mergedData },
        { new: true }
      ).populate('user', 'email username');
    } else {
      const { 
        fullName, 
        bio, 
        location, 
        email,
        phone,
        portfolio,
        institute,
        graduationYear,
        links, 
        skills, 
        experience 
      } = req.body;
      
      userInfo = new UserInfo({
        user: userId,
        fullName,
        bio,
        location,
        email,
        phone,
        portfolio,
        institute,
        graduationYear,
        links,
        skills,
        experience
      });
      await userInfo.save();
      await userInfo.populate('user', 'email username');
    }

    res.status(200).json({ success: true, data: userInfo });
  } catch (error) {
    console.error('Error updating user info:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Patch user info (partial update with upsert)
export const patchUserInfo = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'Unauthorized: User not found in request' });
    }
    const updates = req.body;
    const userId = req.user._id;

    const userInfo = await UserInfo.findOneAndUpdate(
      { user: userId },
      { $set: updates },
      { new: true, upsert: true }
    ).populate('user', 'email username');
    
    res.status(200).json({ success: true, data: userInfo });
  } catch (error) {
    console.error('Error updating specific fields in user info:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete user info
export const deleteUserInfo = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'Unauthorized: User not found in request' });
    }
    const userId = req.user._id;
    const userInfo = await UserInfo.findOneAndDelete({ user: userId });

    if (!userInfo) {
      return res.status(404).json({ success: false, message: 'User info not found' });
    }

    res.status(200).json({ success: true, message: 'User info deleted successfully' });
  } catch (error) {
    console.error('Error deleting user info:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};