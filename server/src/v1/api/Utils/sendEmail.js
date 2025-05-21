// import nodemailer from 'nodemailer';
// import postmark from 'postmark';
// import dotenv from 'dotenv';
// dotenv.config();

// import { success,
//     created,
//     notFound,
//     badRequest,
//     unauthorized,
//     forbidden,
//     serverValidation,
//     unknownError,
//     validation,
//     alreadyExist,
//     sendResponse,
//     invalid,
//     onError} from "../../../../src/v1/api/formatters/globalResponse.js"


// // Nodemailer Connection
// const transporter = nodemailer.createTransport({
//     // host: 'smtpout.secureserver.net',
//     host: 'smtp.gmail.com',
//     port: 465,
//     secure: true, // Use SSL/TLS
//     auth: {
//       user: process.env.CLIENT_EMAIL,
//       pass: process.env.CLIENT_EMAIL_PASSWORD,
//     },
//   });


//   export const sendEmail = async (options) => {
//     try {
//       const mailOptions = {
//         from: process.env.CLIENT_EMAIL,
//         to: options.to,
//         subject: options.subject,
//         html: options.html,
//         attachments: options.attachments || [] // 🔥 this was missing
//       };
  
  
//       const info = await transporter.sendMail(mailOptions);
//       console.log('Email sent: %s', info.messageId);
//       return info;
//     } catch (error) {
//       console.error('Error sending email:', error);
//       throw new Error('Failed to send email');
//     }
//   };


import postmark from 'postmark';
import dotenv from 'dotenv';
dotenv.config();

import {
  success,
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
  onError
} from "../../../../src/v1/api/formatters/globalResponse.js";

// Postmark client setup
const client = new postmark.ServerClient(process.env.SERVER_TOKEN);

export const sendEmail = async (options) => {
  try {
    const emailOptions = {
      "From": `"NY Elizabeth" <${process.env.CLIENT_EMAIL}>`,
      "To": options.to,
      "Cc": options.cc || "",  // <-- CC support
      "Subject": options.subject,
      "HtmlBody": options.html,
      "ReplyTo": process.env.CLIENT_EMAIL_REPLY,
      "MessageStream": "outbound",
      "Attachments": options.Attachments || []
    };

    const info = await client.sendEmail(emailOptions);
    console.log('Email sent: %s', info.MessageID);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

export const sendAuctionInviteEmail = async (auction , userEmail) => {
  try {
    const emailOptions = {
      "From": `"NY Elizabeth" <${process.env.CLIENT_EMAIL}>`,
      "To": userEmail,  // Assuming inviteeEmail is provided in the auction object
      "Subject": `You're Invited: ${auction.auctionProduct.title} Auction`,
      "HtmlBody": `
        <h1>You're Invited to an Auction!</h1>
        <p><strong>Title:</strong> ${auction.auctionProduct.title}</p>
        <p><strong>Start Date:</strong> ${new Date(auction.startDate).toLocaleString()}</p>
        <p>We are excited to have you join our auction event. Stay tuned for more details.</p>
        <p>Best regards, <br> The  Team</p>
      `,
      "ReplyTo": process.env.CLIENT_EMAIL_REPLY,
      "MessageStream": "outbound",
      "Attachments": auction.attachments || []  // Optional attachments if needed
    };

    const info = await client.sendEmail(emailOptions);
    console.log('Auction invite email sent: %s', info.MessageID);
    return info;
  } catch (error) {
    console.error('Error sending auction invite email:', error);
    throw new Error('Failed to send auction invite email');
  }
};