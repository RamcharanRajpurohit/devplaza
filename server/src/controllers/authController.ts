import { Request, Response } from "express";
import { generateAccessAndRefreshToken } from "../utils/generateTokens";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { generateAndSaveOTP } from "../utils/otpUtils";
import { User } from "../models/user";
import { sendResponse } from "../utils/responseHandler";
import { UserInfo } from "../models/userInfo";
import OTP from "../models/otpModel";





// Signup
export const signup = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return sendResponse(res, {
        status: 409,
        success: false,
        message: "Username or Email already exists"
      });
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      isVerified: false,
    });

    // Generate OTP
    const otpGenerated = await generateAndSaveOTP(email);
    if (!otpGenerated) {
      return sendResponse(res, {
        status: 500,
        success: false,
        message: "Failed to generate OTP. Try again later.",
      });
    }

    return sendResponse(res, {
      status: 201,
      message: "User created. OTP sent for verification.",
      data: { userId: newUser._id }
    });

  } catch (error) {
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Something went wrong"
    });
  }
};




// Login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return sendResponse(res, {
        status: 400,
        success: false,
        message: "Invalid credentials"
      })
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendResponse(res, {
        status: 400,
        success: false,
        message: "Invalid password"
      })
    }
    if (!user.isVerified) {
      const otpGenerated = await generateAndSaveOTP(email);
      if (!otpGenerated) {
        return sendResponse(res, {
          status: 500,
          success: false,
          message: "Failed to generate OTP. Try again later.",
        })
      }
      return sendResponse(res, {
        status: 403,//valid authorization reqest but first refusew to proceed
        success: false,
        code: "USER_NOT_VERIFIED",
        message: "User not verified. OTP resent to your email."
      })

    }

    const { accessToken, refreshToken } = generateAccessAndRefreshToken(
      { _id: user._id },
      { _id: user._id }
    );



    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 15* 24 * 60 * 60 * 1000,
    });
    return sendResponse(res, {
      status: 200,
      message: "Login successful",
      data: {
        accessToken,
        user: { id: user._id, username: user.username, email: user.email }
      }
    });

  }
  catch (error) {
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Something went wrong"
    });
  }
};



export const logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.jwt;
    if (!refreshToken)
      return sendResponse(res, { status: 200, success: true, message: "No active session" });

    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    return sendResponse(res, { status: 200, success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return sendResponse(res, { status: 500, success: false, message: "Something went wrong" });
  }
};




interface AccessTokenPayload {
  _id: string;
}
interface RefreshTokenPayload {
  _id: string;
}

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401);

    const RefreshToken = cookies.jwt;
   
    // verify refresh token
    let decoded: RefreshTokenPayload;
    try {
      decoded = jwt.verify(
        RefreshToken,
        process.env.REFRESH_TOKEN_SECRET as string
      ) as RefreshTokenPayload;
    } catch (err) {
      return res.sendStatus(403);
    }



    // Generate new tokens
    const accessToken = jwt.sign(
      { _id: decoded._id.toString() } as AccessTokenPayload,
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "15m" }
    );

    const user = await User.findById(decoded._id).lean();
    res.status(200).json({ accessToken, email: user?.email, user: user });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};




const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID as string);

export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { id_token } = req.body;
    if (!id_token) {
      return res.status(400).json({ message: "Missing Google ID token" });
    }

    // verify with Google
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json({ message: "Google token invalid" });
    }

    const { sub: googleId, email, name, picture, email_verified } = payload;
    console.log(payload);
    if (!email_verified) {
      return res.status(403).json({ message: "Email not verified with Google" });
    }

    // find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        username: name || email,
        email,
        password: null,          // no local password
        isVerified: true,        // Google verified
        googleId,
        profilePic: picture,
      });
    }

    // generate tokens
    const { accessToken, refreshToken } = generateAccessAndRefreshToken(
      { _id: user._id, email: user.email },
      { _id: user._id, email: user.email }
    );


    // set cookie
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: "Google login successful",
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      },
    });
  } catch (err) {

    return res.status(500).json({ message: "Something went wrong" });
  }
};


export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }
    const user = await User.findOne({ email });
    if (!user || !user.email) {
      return res.status(404).json({
        success: false,
        message: "User not found with this email address"
      });
    }
    const otpGenerated = await generateAndSaveOTP(user.email);
    if (!otpGenerated) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate reset code. Please try again."
      });
    }
    res.status(200).json({
      success: true,
      message: "Password reset code sent to your email successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later."
    });
  }
};

export const updateUserName = async (req:Request, res:Response) => {
  console.log('🔄 Updating username:', req.body);
  try {
    const { username } = req.body;
    
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'Unauthorized: User not found in request' });
    }

    if (!username || username.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'Username must be at least 3 characters long' });
    }

    const existingUser = await User.findOne({ 
      username: username.trim(),
      _id: { $ne: req.user._id } 
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { username: username.trim() },
      { new: true }
    ).select('-password');

    console.log('Username updated successfully:', updatedUser);
    res.status(200).json({ success: true, data: updatedUser, message: 'Username updated successfully' });
  } catch (error) {
    console.error('Error updating username:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}
 export const updateUserEmail = async (req: Request, res: Response) => {
  console.log('🔄 Updating email:', req.body);
  try {
    const { email } = req.body;
    
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'Unauthorized: User not found in request' });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

   
    const existingUser = await User.findOne({ 
      email: email.toLowerCase().trim(),
      _id: { $ne: req.user._id } 
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { 
        email: email.toLowerCase().trim(),
        emailVerified: false
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
    console.error('Error updating email:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}
export const getMe =async (req:Request, res:Response) => {
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
    console.error('Error fetching current user:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

export const changePassword =async (req:Request, res:Response) => {
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

    console.log(' Password changed successfully for user:', req.user._id);
    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

export const  resetPassword =async (req:Request, res:Response) => {
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
}

export const deleteAccount =async (req:Request, res:Response) => {
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
}


//otp things



interface VerifyOTPRequest extends Request {
  body: {
    email: string;
    otp: string;
  };
}

export const verifyOtp = async (req: VerifyOTPRequest, res: Response): Promise<Response> => {
  try {
    const { email, otp } = req.body;

    const checkOtpPresent = await OTP.findOne({ email, otp });
    const checkUserPresent = await User.findOne({ email });

    if (!checkOtpPresent || !checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: "OTP expired or incorrect",
      });
    }

    // Mark user verified
    checkUserPresent.isVerified = true;
    await checkUserPresent.save();

    // Delete used OTPs
    await OTP.deleteMany({ email });
    
    // Generate tokens
    const { accessToken, refreshToken } = generateAccessAndRefreshToken(
      {_id: checkUserPresent._id},
      {_id: checkUserPresent._id}
    );

  
    // Set cookie
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge:15 * 24 * 60 * 60 * 1000,
    });
   
    return res.status(200).json({
      success: true,
      message: "OTP verification successful",
      token: accessToken,
      user:{
        id: checkUserPresent._id,
        email: checkUserPresent.email,
        username: checkUserPresent.username,
        isProfileCompleted:false,
      }
    });
  } catch (error: any) {
    console.error(error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};




export const resendOtp = async (req: Request, res: Response) => {
  try {
    
    const _id = req.body.userId;
    if (! _id) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }

    // Generate OTP again
    if (!user.email) {
      return res.status(400).json({ message: "User email not found" });
    }

    const otpGenerated = await generateAndSaveOTP(user.email);


    if (!otpGenerated) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate OTP. Try again later.",
      });
    }

    res.json({
      success: true,
      message: "OTP resent successfully. Please check your email."
    });

  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};


