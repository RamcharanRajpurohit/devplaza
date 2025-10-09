import mongoose, { Document, Schema } from 'mongoose';
import mailSender from '../utils/mailSender';


interface OtpDocument extends Document {
  email: string;
  otp: string;
  createdAt: Date;
  isNew: boolean;
}


const otpSchema: Schema<OtpDocument> = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },

  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 5,
  },
});


async function sendVerificationEmail(email: string, otp: string): Promise<void> {
  try {
    const mailResponse = await mailSender(
      email,
      "Verification Email",
      `<h1>Please confirm your OTP</h1>
       <p>Here is your OTP code: ${otp}</p>`
    );
    console.log("Email sent successfully: ", mailResponse);
  } catch (error) {
    console.log("Error occurred while sending email: ", error);
    throw error;
  }
}


otpSchema.pre<OtpDocument>('save', async function (next) {
  console.log("New document saved to the database");
  if (this.isNew) {
    await sendVerificationEmail(this.email, this.otp);
  }
  next();
});

const OTP = mongoose.model<OtpDocument>('OTP', otpSchema);
export default OTP;
