import nodemailer from 'nodemailer';

export const sendOTPByEmail = async (to: string, otp: string) => {
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST, // smtp.gmail.com
    port: parseInt(process.env.MAIL_PORT || '587'), // 587
    secure: false, // STARTTLS (true for port 465)
    auth: {
      user: process.env.MAIL_USERNAME, // Your Gmail address
      pass: process.env.MAIL_PASSWORD, // App password
    },
  });

  const mailOptions = {
    from: `"STLR" <${process.env.MAIL_FROM_ADDRESS}>`,
    to,
    subject: 'Your OTP Code',
    text: `Your OTP code is: ${otp}\nThis code will expire in 5 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully');
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('EMAIL_SENDING_FAILED');
  }
};


// export const sendOTPByEmail = async (to: string, otp: string) => {
//   const transporter = nodemailer.createTransport({
//     host: 'email-smtp.us-east-1.amazonaws.com', // Correct AWS SES SMTP endpoint
//     port: 587, // Use 587 for STARTTLS (or 465 for SSL)
//     secure: false, // Set to true if using port 465 for SSL
//     auth: {
//       user: process.env.SMTP_USERNAME, // AWS SES SMTP user
//       pass: process.env.SMTP_PASSWORD, // AWS SES SMTP password
//     },
//   });

//   const mailOptions = {
//     from: `"ReaderHub" <${process.env.SES_FROM_EMAIL}>`, // SES verified email
//     to,
//     subject: 'Your ReaderHub OTP Code',
//     text: `Your OTP code is: ${otp}\nThis code will expire in 5 minutes.`,
//   };

//   try {
//     // Send the OTP email and wait for the result
//     await transporter.sendMail(mailOptions);
//     console.log('OTP email sent successfully');
//   } catch (error) {
//     // If there is an error, throw it
//     console.error('Error sending OTP email:', error);
//     throw new Error('EMAIL_SENDING_FAILED'); // Throw custom error message
//   }
// };

// import { SendEmailCommand } from "@aws-sdk/client-ses";
// import { sesClient } from "../utilts/awsConfig"; 

// export const sendOTPByEmail = async (email: string, otp: string): Promise<string> => {
//   const params = {
//     Source: process.env.SES_FROM_EMAIL!,
//     Destination: { ToAddresses: [email] },
//     Message: {
//       Subject: { Data: "Your OTP Code" },
//       Body: {
//         Text: { Data: `Your OTP code is: ${otp}. It expires in 10 minutes.` },
//       },
//     },
//   };

//   try {
//     const command = new SendEmailCommand(params);
//     await sesClient.send(command);
//     console.log(`OTP sent to ${email}`);
//     return "OTP_SENT";
//   } catch (error) {
//     console.error("AWS SES Error:", error);
//     return "EMAIL_SENDING_FAILED";
//   }
// };

