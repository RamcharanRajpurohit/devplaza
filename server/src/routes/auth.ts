// import { Router } from 'express';
// import jwt from 'jsonwebtoken';
// import User from '../models/user';

// const router = Router();



// router.post('/complete-profile', async (req, res) => {
//   try {
//     const { bio, name, githubProfile, leetcodeProfile, codechefProfile } = req.body;
//     if(!req.user || !req.user._id) {
//       return res.status(401).json({ error: 'Unauthorized: User not found in request' });
//     }
//     const userId = req.user._id; // Assuming you have authentication middleware

//     await User.findByIdAndUpdate(userId, {
//       bio,
//       name,
//       githubProfile,
//       leetcodeProfile,
//       codechefProfile,
//       profileCompleted: true
//     });

//     res.json({ success: true });
//   } catch (error) {
//     res.status(500).json({ error: 'Profile update failed' });
//   }
// });

// // ...existing routes

// export default router;