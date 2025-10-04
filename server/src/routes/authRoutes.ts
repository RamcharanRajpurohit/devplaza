import express from "express";
import { signup, login,refreshToken, logout,googleAuth ,forgotPassword} from "../controllers/authController";
import { authenticateToken} from "../middleware/auth";
import { User } from "../models/user";
import bcrypt from "bcrypt";
import { UserInfo } from "../models/userInfo";

import { verifyOtp,resendOtp} from '../controllers/otpController';
const router = express.Router();

router.post("/signup", signup);
router.post("/google", googleAuth);
router.post("/login", login);
router.post('/verify-otp', verifyOtp);
router.post("/refresh-token",refreshToken);
router.post("/resend-otp",resendOtp )
router.post("/forgot-password",forgotPassword )
router.post("/logout",logout);

// Update username
router.patch('/update-username', authenticateToken, async (req, res) => {
  console.log('🔄 Updating username:', req.body);
  try {
    const { username } = req.body;
    
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'Unauthorized: User not found in request' });
    }

    if (!username || username.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'Username must be at least 3 characters long' });
    }

    // Check if username already exists
    const existingUser = await User.findOne({ 
      username: username.trim(),
      _id: { $ne: req.user._id } // Exclude current user
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { username: username.trim() },
      { new: true }
    ).select('-password');

    console.log('✅ Username updated successfully:', updatedUser);
    res.status(200).json({ success: true, data: updatedUser, message: 'Username updated successfully' });
  } catch (error) {
    console.error('❌ Error updating username:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update email
router.patch('/update-email', authenticateToken, async (req, res) => {
  console.log('🔄 Updating email:', req.body);
  try {
    const { email } = req.body;
    
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'Unauthorized: User not found in request' });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ 
      email: email.toLowerCase().trim(),
      _id: { $ne: req.user._id } // Exclude current user
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { 
        email: email.toLowerCase().trim(),
        emailVerified: false // Reset email verification when email changes
      },
      { new: true }
    ).select('-password');

    console.log('✅ Email updated successfully:', updatedUser);
    res.status(200).json({ 
      success: true, 
      data: updatedUser, 
      message: 'Email updated successfully. Please verify your new email address.' 
    });
  } catch (error) {
    console.error('❌ Error updating email:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Change password
router.patch('/change-password', authenticateToken, async (req, res) => {
  console.log('🔄 Changing password for user:', req.user?._id);
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'Unauthorized: User not found in request' });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both current and new passwords are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
    }

    // Get user with password
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await User.findByIdAndUpdate(req.user._id, { password: hashedNewPassword });

    console.log('✅ Password changed successfully for user:', req.user._id);
    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('❌ Error changing password:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// Reset password with OTP
router.post('/reset-password', async (req, res) => {
  console.log('🔄 Reset password with OTP');
  try {
    const { email, otp, newPassword } = req.body;
    
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
    }

    const user = await User.findOne({ 
      email: email.toLowerCase().trim(),
      resetPasswordOTP: otp,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear OTP
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      resetPasswordOTP: undefined,
      resetPasswordExpires: undefined
    });

    console.log('✅ Password reset successfully for user:', user._id);
    res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('❌ Error resetting password:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete account
router.delete('/delete-account', authenticateToken, async (req, res) => {
  console.log('🗑️ Deleting account for user:', req.user?._id);
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'Unauthorized: User not found in request' });
    }

    const userId = req.user._id;

    // Delete user info first
    await UserInfo.findOneAndDelete({ user: userId });
    
    // Delete user account
    await User.findByIdAndDelete(userId);

    console.log('✅ Account deleted successfully for user:', userId);
    res.status(200).json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting account:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'Unauthorized: User not found in request' });
    }

    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('❌ Error fetching current user:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;

