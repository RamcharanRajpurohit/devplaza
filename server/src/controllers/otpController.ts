// controllers/otpController.ts
import { Request, Response } from "express";
import OTP from "../models/otpModel";
import { User } from "../models/user";
import { UserTokens } from "../models/userTokens";
import { generateAccessAndRefreshToken } from "../utils/generateTokens";
import { generateAndSaveOTP } from "../utils/otpUtils";

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
      { userId: checkUserPresent._id, email: checkUserPresent.email },
      { userId: checkUserPresent._id, email: checkUserPresent.email }
    );

    // Save refresh token in UserTokens collection instead of User
    let tokenDoc = await UserTokens.findOne({ user: checkUserPresent._id });
    if (!tokenDoc) {
      tokenDoc = await UserTokens.create({
        user: checkUserPresent._id,
        refreshToken: [refreshToken],
      });
    } else {
      tokenDoc.refreshToken.push(refreshToken);
      await tokenDoc.save();
    }

    // Set cookie
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "OTP verification successful",
      token: accessToken,
    });
  } catch (error: any) {
    console.error(error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};



// Resend OTP
export const resendOtp = async (req: Request, res: Response) => {
  try {
    // Extract user info from verified token (middleware should decode JWT)
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. Invalid token." });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If already verified, no need to resend
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

