import otpGenerator from "otp-generator";
import OTP from "../models/otpModel";


export const generateAndSaveOTP = async (email: string): Promise<boolean> => {
  try {
    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    while (await OTP.findOne({ otp })) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
    }

    await OTP.create({ email, otp });
    return true;
  } catch (error) {
    console.error("OTP generation failed:", error);
    return false;
  }
};
