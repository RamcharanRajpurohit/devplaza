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


// import { Router, Request, Response } from 'express';
// import User from '../models/User';
// import Profile from '../models/Profile';
// import authMiddleware from '../middleware/auth';

// const router = Router();

// // Get public profile by username
// router.get('/profile/public/:username', async (req: Request, res: Response) => {
//   try {
//     const { username } = req.params;
//     const user = await User.findOne({ username });
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     const profile = await Profile.findOne({ user: user._id });
//     if (!profile || !profile.isPublic) return res.status(403).json({ message: 'Profile not public' });

//     // Compose public profile data
//     res.json({
//       username: user.username,
//       fullName: user.fullName,
//       location: profile.location || '',
//       institution: profile.institution || '',
//       platformStats: profile.platformStats || [],
//       contestData: profile.contestData || [],
//       dsaTopics: profile.dsaTopics || [],
//       totalQuestions: profile.totalQuestions || 0,
//       totalActiveDays: profile.totalActiveDays || 0,
//       totalContests: profile.totalContests || 0,
//       viewCount: profile.viewCount || 0,
//       lastRefresh: profile.lastRefresh || '',
//       awards: profile.awards || 0,
//       socialLinks: profile.socialLinks || {},
//     });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err?.message });
//   }
// });

// // Record profile view
// router.post('/profile/view/:username', async (req: Request, res: Response) => {
//   try {
//     const { username } = req.params;
//     const user = await User.findOne({ username });
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     const profile = await Profile.findOne({ user: user._id });
//     if (!profile) return res.status(404).json({ message: 'Profile not found' });

//     profile.viewCount = (profile.viewCount || 0) + 1;
//     await profile.save();
//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err?.message });
//   }
// });

// // Get profile stats
// router.get('/profile/stats/:username', async (req: Request, res: Response) => {
//   try {
//     const { username } = req.params;
//     const user = await User.findOne({ username });
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     const profile = await Profile.findOne({ user: user._id });
//     if (!profile) return res.status(404).json({ message: 'Profile not found' });

//     res.json({
//       totalQuestions: profile.totalQuestions || 0,
//       totalActiveDays: profile.totalActiveDays || 0,
//       totalContests: profile.totalContests || 0,
//       awards: profile.awards || 0,
//       viewCount: profile.viewCount || 0,
//     });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err?.message });
//   }
// });

// // Update profile visibility (authenticated)
// router.put('/profile/visibility', authMiddleware, async (req: Request, res: Response) => {
//   try {
//     // Check if user is attached by auth middleware
//     if (!req.user || !req.user._id) return res.status(401).json({ message: 'Unauthorized' });
//     const { isPublic } = req.body;
//     const profile = await Profile.findOne({ user: req.user._id });
//     if (!profile) return res.status(404).json({ message: 'Profile not found' });

//     profile.isPublic = !!isPublic;
//     await profile.save();
//     res.json({ success: true, isPublic: profile.isPublic });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err?.message });
//   }
// });

// // Generate profile image (stub, implement as needed)
// router.post('/profile/generate-image/:username', async (req: Request, res: Response) => {
//   // ...implement image generation logic...
//   res.json({ success: true, imageUrl: '/path/to/generated/image.png' });
// });

// export default router;
