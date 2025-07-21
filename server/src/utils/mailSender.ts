import nodemailer from 'nodemailer';

// 1️⃣ Define the function signature
const mailSender = async (
  email: string,
  title: string,
  body: string
): Promise<nodemailer.SentMessageInfo | undefined> => {
  try {
    // 2️⃣ Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      }
    });

    // 3️⃣ Send the email
    const info = await transporter.sendMail({
      from: `"DevPlaza" <profileplaza@gmial.com>`,
      to: email,
      subject: title,
      html: body,
    });

    console.log("Email info: ", info);
    return info;
  } catch (error: any) {
    // 4️⃣ Always type the error in a catch block
    console.log(error.message);
    return undefined; // optional, but TS likes it
  }
};

export default mailSender;
