import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { UserInfo } from '../models/userInfo';

const router = express.Router();

// Create or Update user info
router.post('/', authenticateToken, async (req, res) => {
  console.log('📝 Creating/Updating user info:', req.body);
  try {
    const { fullName, bio, location, links, skills, experience } = req.body;
    if (!req.user || !req.user._id) {
      console.log('🚫 Unauthorized: No user info in request');
      return res.status(401).json({ success: false, message: 'Unauthorized: User not found in request' });
    }
    const userId = req.user._id;

    let userInfo = await UserInfo.findOne({ user: userId });

    if (userInfo) {
      // Update existing user info
      userInfo = await UserInfo.findOneAndUpdate(
        { user: userId },
        { fullName, bio, location, links, skills, experience },
        { new: true }
      );
    } else {
      // Create new user info
      userInfo = new UserInfo({
        user: userId,
        fullName,
        bio,
        location,
        links,
        skills,
        experience
      });
      await userInfo.save();
    }
    console.log('✅ User info saved successfully:', userInfo);
    res.status(200).json({ success: true, data: userInfo });
  } catch (error) {
    console.error('❌ Error saving user info:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user info
router.get('/:userId', async (req, res) => {
  console.log('🔍 Fetching user info for userId:', req.params.userId);
  try {
    const userInfo = await UserInfo.findOne({ user: req.params.userId })
      .populate('user', 'email username');

    if (!userInfo) {
      return res.status(404).json({ success: false, message: 'User info not found' });
    }
    console.log('✅ User info retrieved:', userInfo);
    res.status(200).json({ success: true, data: userInfo });
  } catch (error) {
    console.error('❌ Error fetching user info:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update user info
router.put('/', authenticateToken, async (req, res) => {
  console.log('🔄 Updating user info:', req.body);
  try {
    const { fullName, bio, location, links, skills, experience } = req.body;
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'Unauthorized: User not found in request' });
    }
    const userId = req.user._id;

    const userInfo = await UserInfo.findOneAndUpdate(
      { user: userId },
      { fullName, bio, location, links, skills, experience },
      { new: true }
    );

    if (!userInfo) {
      return res.status(404).json({ success: false, message: 'User info not found' });
    }
    console.log('✅ User info updated successfully:', userInfo);
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

// Update specific fields
router.patch('/', authenticateToken, async (req, res) => {
  console.log('✏️ Updating specific fields in user info:', req.body);
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'Unauthorized: User not found in request' });
    }
    const updates = req.body;
    const userId = req.user._id;

    const userInfo = await UserInfo.findOneAndUpdate(
      { user: userId },
      { $set: updates },
      { new: true }
    );

    if (!userInfo) {
      return res.status(404).json({ success: false, message: 'User info not found' });
    }
    console.log('✅ User info updated with specific fields:', userInfo);
    res.status(200).json({ success: true, data: userInfo });
  } catch (error) {
    console.error('❌ Error updating specific fields in user info:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
