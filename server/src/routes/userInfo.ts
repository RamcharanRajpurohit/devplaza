import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { UserInfo } from '../models/userInfo';

const router = express.Router();

// Helper function to merge objects, only updating provided fields
const mergeUpdates = (existing: any, updates: any) => {
  const merged = { ...existing };
  
  for (const key in updates) {
    if (updates[key] !== undefined && updates[key] !== null) {
      // For nested objects (like links, experience), merge them
      if (typeof updates[key] === 'object' && !Array.isArray(updates[key]) && existing[key]) {
        merged[key] = { ...existing[key], ...updates[key] };
      } else {
        // For primitive values and arrays, replace
        merged[key] = updates[key];
      }
    }
  }
  
  return merged;
};

// Get current user's info (authenticated)
router.get('/', authenticateToken, async (req, res) => {
  console.log('🔍 Fetching current user info for userId:', req.user?._id);
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'Unauthorized: User not found in request' });
    }

    const userInfo = await UserInfo.findOne({ user: req.user._id })
      .populate('user', 'email username');

    if (!userInfo) {
      // Return empty user info structure instead of 404 for current user
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
    console.error('❌ Error fetching user info:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create or Update user info (Smart merge - only updates provided fields)
router.post('/', authenticateToken, async (req, res) => {
  console.log('📝 Creating user info:', req.body);
  try {
    if (!req.user || !req.user._id) {
      console.log('🚫 Unauthorized: No user info in request');
      return res.status(401).json({ success: false, message: 'Unauthorized: User not found in request' });
    }
    const userId = req.user._id;

    // Check if user info already exists
    const existingUserInfo = await UserInfo.findOne({ user: userId });

    if (existingUserInfo) {
      console.log('🚫 User info already exists');
      return res.status(403).json({ 
        success: false, 
        message: 'User info already created. Use PUT request to update.' 
      });
    }

    // Create new user info
    console.log('✨ Creating new user info...');
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
    console.error('❌ Error creating user info:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user info by userId (public)
router.get('/:userId', async (req, res) => {
  console.log('🔍 Fetching user info for userId:', req.params.userId);
  try {
    const userInfo = await UserInfo.findOne({ user: req.params.userId })
      .populate('user', 'email username');

    if (!userInfo) {
      return res.status(404).json({ success: false, message: 'User info not found' });
    }
   
    res.status(200).json({ success: true, data: userInfo });
  } catch (error) {
    console.error('❌ Error fetching user info:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update user info (PUT - smart merge, only updates provided fields)
router.put('/', authenticateToken, async (req, res) => {
  console.log('🔄 Updating user info:', req.body);
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'Unauthorized: User not found in request' });
    }
    const userId = req.user._id;

    // First, check if user info exists
    let userInfo = await UserInfo.findOne({ user: userId });
    
    if (userInfo) {
      // Merge updates with existing data
      console.log('📋 User info exists, merging updates...');
      
      const existingData = userInfo.toObject();
      const updates = req.body;
      
      const mergedData: any = {};
      
      // Handle top-level fields
      if (updates.fullName !== undefined) mergedData.fullName = updates.fullName;
      if (updates.bio !== undefined) mergedData.bio = updates.bio;
      if (updates.location !== undefined) mergedData.location = updates.location;
      if (updates.email !== undefined) mergedData.email = updates.email;
      if (updates.phone !== undefined) mergedData.phone = updates.phone;
      if (updates.portfolio !== undefined) mergedData.portfolio = updates.portfolio;
      if (updates.institute !== undefined) mergedData.institute = updates.institute;
      if (updates.graduationYear !== undefined) mergedData.graduationYear = updates.graduationYear;
      if (updates.skills !== undefined) mergedData.skills = updates.skills;
      
      // Merge nested objects
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
      // Create new if doesn't exist
      console.log('✨ Creating new user info...');
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
    console.error('❌ Error updating user info:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete user info
router.delete('/', authenticateToken, async (req, res) => {
  console.log('🗑️ Deleting user info');
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'Unauthorized: User not found in request' });
    }
    const userId = req.user._id;
    const userInfo = await UserInfo.findOneAndDelete({ user: userId });

    if (!userInfo) {
      return res.status(404).json({ success: false, message: 'User info not found' });
    }
    console.log('✅ User info deleted successfully');
    res.status(200).json({ success: true, message: 'User info deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting user info:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update specific fields (PATCH - partial update)
router.patch('/', authenticateToken, async (req, res) => {
  
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

    console.log('✅ User info updated with specific fields:', userInfo);
    res.status(200).json({ success: true, data: userInfo });
  } catch (error) {
    console.error('❌ Error updating specific fields in user info:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;