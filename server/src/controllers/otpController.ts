// controllers/otpController.ts
import { Request, Response } from 'express';
import OTP from '../models/otpModel';
import {User} from '../models/user';
import { generateAccessAndRefreshToken } from '../utils/generateTokens';

interface verifyOTPRequest extends Request {
  body: {
    email: string;
    otp :string;
  };
}





export const verifyOtp = async (req:verifyOTPRequest,res:Response): Promise<Response> =>{
    try{
           const { email,otp } = req.body;

    
    const checkOtpPresent = await OTP.findOne({ email ,otp});
    const checkUserPresent = await User.findOne({ email });

    if (!checkOtpPresent || !checkUserPresent ) {
      return res.status(401).json({
        success: false,
        message: ' OTP expired or incorrect',
      });
    }

    checkUserPresent.isVerified = true;
    
    await OTP.deleteMany({email})

     const {accessToken,refreshToken} = generateAccessAndRefreshToken({ userId: checkUserPresent._id, email:checkUserPresent.email },{ userId: checkUserPresent._id, email:checkUserPresent.email })
     checkUserPresent.refreshToken =refreshToken;
    await checkUserPresent.save();
     res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        sameSite: 'none', 
        secure: true,
       
        maxAge: 24 * 60 * 60 * 1000,
     });
      
     return res.status(200).json({
      success: true,
      message: 'OTP verification successful',
      token :accessToken,
    });
    }
    catch(error:any){
         console.error(error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
    }
};