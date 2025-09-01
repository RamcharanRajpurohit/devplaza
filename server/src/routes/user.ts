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
