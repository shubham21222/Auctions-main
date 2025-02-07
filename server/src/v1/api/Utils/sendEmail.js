import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

import { success,
    created,
    notFound,
    badRequest,
    unauthorized,
    forbidden,
    serverValidation,
    unknownError,
    validation,
    alreadyExist,
    sendResponse,
    invalid,
    onError} from "../../../../src/v1/api/formatters/globalResponse.js"


// Nodemailer Connection
const transporter = nodemailer.createTransport({
    // host: 'smtpout.secureserver.net',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Use SSL/TLS
    auth: {
      user: process.env.CLIENT_EMAIL,
      pass: process.env.CLIENT_EMAIL_PASSWORD,
    },
  });


  export const sendEmail = async (options) => {
    try {
      const mailOptions = {
        from: process.env.CLIENT_EMAIL,
        to: options.to,
        subject: options.subject,
        html: options.html,
      };
  
  
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent: %s', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  };