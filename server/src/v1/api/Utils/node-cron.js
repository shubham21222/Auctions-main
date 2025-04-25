import cron from "node-cron";
import Auction from  "../models/Auction/auctionModel.js";
import User from "../models/Auth/User.js";
import stripe from "../config/stripeConfig.js"
import nodemailer from "nodemailer";
import postmark from 'postmark'
import dotenv from 'dotenv';
dotenv.config();


// cron.schedule("*/1 * * * *", async () => {  // Runs every 1 minute
//     try {
//         console.log("Running auction expiry check...");
//         const now = new Date();

//         const expiredAuctions = await Auction.find({ 
//             status: "ACTIVE", 
//             endDate: { $lte: now } 
//         });

//         if (expiredAuctions.length > 0) {
//             for (const auction of expiredAuctions) {
//                 auction.status = "ENDED";
//                 auction.winner = auction.currentBidder || null; // Avoid assigning null if no bids
//                 auction.winnerBidTime = new Date();
//                 await auction.save();
//             }

//             console.log(`✅ ${expiredAuctions.length} auctions ended.`);
//         } else {
//             console.log("✅ No expired auctions found.");
//         }
//     } catch (error) {
//         console.error("❌ Error in cron job:", error);
//     }
// });


export const createPaymentLink = async (amount, currency, productName, metadata) => {

    // console.log( "metadata:", metadata.image);

    try {
        // Ensure amount is a valid number
        if (!amount || isNaN(amount)) {
            throw new Error("Invalid amount value provided.");
        }

        const amountInCents = Math.round(Number(amount) * 100); // Convert amount to cents safely

        // Step 1: Create a Product in Stripe
        const product = await stripe.products.create({
            name: productName,
            images: metadata.image ? [metadata.image] : [], // Include product image if available
        });

        // console.log("✅ Stripe Product created:", product.id);

        // Step 2: Create a Price for the Product
        const price = await stripe.prices.create({
            currency: currency,
            unit_amount: amountInCents,
            product: product.id, // Use the created Product ID
        });

        // console.log("✅ Stripe Price created:", price.id);

        // Step 3: Use the created Price ID to generate a Payment Link
        const paymentLink = await stripe.paymentLinks.create({
            line_items: [
                {
                    price: price.id, // Use the created price ID
                    quantity: 1,
                    adjustable_quantity: {
                        enabled: true, // Allow quantity adjustment
                        minimum: 1,
                        maximum: 10,
                    },
                },
            ],
            after_completion: {
                type: "redirect",
                redirect: { url: "https://bid.nyelizabeth.com/payment-success" }, // Success URL
            },
            metadata: metadata,
        });

        console.log("✅ Payment link created:", paymentLink.url);
        return paymentLink.url;
    } catch (error) {
        console.error("❌ Error creating payment link:", error.message);
        return null;
    }
};






// Postmark client setup
const client = new postmark.ServerClient(process.env.SERVER_TOKEN);

// Function to send email
export const sendPaymentEmail = async (email, paymentLink, auctionTitle, bidAmount, productTitle, name) => {
    try {
      const subject = `🎉 Congratulations! You Won the Auction for ${productTitle} (${auctionTitle})`;
  
      const html = `
        <p>Dear ${name || "Bidder"},</p>
  
        <p>Congratulations! You have won the auction for <b>${productTitle}</b> (<b>${auctionTitle}</b>).</p>
  
        <p><strong>Winning Bid:</strong> $${bidAmount}</p>
  
        <p>To secure your item, please complete the payment using the link below:</p>
  
        <p><a href="${paymentLink}" style="background-color:#008CBA; color:white; padding:10px 15px; text-decoration:none; display:inline-block; font-size:16px; border-radius:5px;">Complete Payment</a></p>
  
        <p>If you have any questions, feel free to reach out.</p>
  
        <p>Thank you for participating!</p>
        <p>Best Regards,<br> Your Auction Team</p>
      `;
  
      const emailOptions = {
        "From": `"NY Elizabeth" <${process.env.CLIENT_EMAIL}>`,
        To: email,
        Subject: subject,
        HtmlBody: html,
        TextBody: `Dear ${name || "Bidder"},\n\nYou won the auction for ${productTitle} (${auctionTitle}). Winning Bid: $${bidAmount}\n\nComplete your payment here: ${paymentLink}\n\nThank you!`,
        ReplyTo: process.env.CLIENT_EMAIL_REPLY,
        MessageStream: "outbound"
      };
  
      const info = await client.sendEmail(emailOptions);
      console.log(`📧 Payment email sent to ${email}`);
      return info;
    } catch (error) {
      console.error("❌ Error sending payment email:", error?.message || error);
      if (error?.response) console.error('Postmark response:', error.response);
      throw new Error("Failed to send payment email");
    }
  };




cron.schedule("*/1 * * * *", async () => {
    try {
        console.log("⏳ Checking for expired auctions...");

        const now = new Date();
        console.log("Now:", now);


        // Find auctions that are either expired or already marked as ended, but haven't sent emails yet
        const expiredAuctions = await Auction.find({
            $or: [
                { status: "ACTIVE", endDate: { $lte: now }, Emailsend: "false", winner: { $ne: null } }, // Expired active auctions with a winner
                { status: "ENDED", Emailsend: "false", winner: null }

            ]
        }).populate({
            path: 'auctionProduct',
            select: 'title image' // Get title and image of the product
        });

        // console.log("expiredAuctions" , expiredAuctions)
        



        if (expiredAuctions.length === 0) {
            console.log("✅ No expired auctions found that need email processing.");
            return;
        }

        for (const auction of expiredAuctions) {
            auction.status = "ENDED"; // Ensure auction is marked as ended
            auction.winner = auction.currentBidder || null;
            auction.winnerBidTime = new Date();

            await auction.save();

            if (auction.winner) {
                const findUser = await User.findById(auction.winner);
                if (!findUser) {
                    console.error(`❌ User not found for winner ID: ${auction.winner}`);
                    continue;
                }

                   // Get product details (title and first image)
                   const productTitle = auction.auctionProduct?.title || "Auction Product";
                   const productImage = auction.auctionProduct?.image?.[0] || "";

                const paymentLink = await createPaymentLink(
                    auction.currentBid,
                    "usd",
                    productTitle, // Send the title as product name,
                    {
                        auctionId: auction._id.toString(),
                        userId: findUser._id.toString(),
                        email: findUser.email || "",
                        name: findUser.name || "",
                        phone: findUser.mobile || "",
                        image: productImage, // Send product image in metadata
                    }
                );

                if (!paymentLink) {
                    console.error("❌ Failed to create payment link.");
                    continue;
                }

                const emailSent = await sendPaymentEmail(
                    findUser.email,
                    paymentLink,
                    auction.lotNumber,
                    auction.currentBid,
                    productTitle,
                    findUser.name
                );

                if (emailSent) {
                    console.log(`✅ Payment email sent to ${findUser.email}`);
                    
                    // ✅ Mark the auction as Emailsend: true to prevent duplicate emails
                    auction.Emailsend = "true";
                    await auction.save();
                } else {
                    console.error(`❌ Failed to send email to ${findUser.email}`);
                }
            }
            
        }

        console.log(`✅ ${expiredAuctions.length} auctions updated to ENDED, emails sent where needed.`);
    } catch (error) {
        console.error("❌ Error in cron job:", error);
    }
});


cron.schedule("*/1 * * * *", async () => {  // Runs every minute
    try {
        console.log("⏳ Checking auctions that should be ended...");

        const now = new Date();

        // Find auctions that have either expired or haven't started
        const auctionsToEnd = await Auction.find({
            endDate: { $lte: now }, // Auction time is over
            status: "ACTIVE", // Only update active auctions
            Emailsend: "false" // Ensure email is not already sent
        })
        .populate({
            path: 'auctionProduct',
            select: 'title image' // Get title and image of the product
        });
        

        if (auctionsToEnd.length === 0) {
            console.log("✅ No auctions need to be ended.");
            return;
        }

        for (const auction of auctionsToEnd) {
            auction.status = "ENDED";
            auction.winner = auction.currentBidder || null;
            auction.winnerBidTime = new Date();

            await auction.save();

            if (auction.winner) {
                const findUser = await User.findById(auction.winner);
                if (!findUser) {
                    console.error(`❌ User not found for winner ID: ${auction.winner}`);
                    continue;
                }

                   // Get product details (title and first image)
                   const productTitle = auction.auctionProduct?.title || "Auction Product";
                   const productImage = auction.auctionProduct?.image?.[0] || "";

                const paymentLink = await createPaymentLink(
                    auction.currentBid,
                    "usd",
                    productTitle, // Send the title as product name,
                    {
                        auctionId: auction._id.toString(),
                        userId: findUser._id.toString(),
                        email: findUser.email || "",
                        name: findUser.name || "",
                        phone: findUser.mobile || "",
                        image: productImage, // Send product image in metadata
                    }
                );

                if (!paymentLink) {
                    console.error("❌ Failed to create payment link.");
                    continue;
                }

                const emailSent = await sendPaymentEmail(
                    findUser.email,
                    paymentLink,
                    auction.lotNumber,
                    auction.currentBid,
                    productTitle,
                    findUser.name
                );

                if (emailSent) {
                    console.log(`✅ Payment email sent to ${findUser.email}`);
                    
                    // ✅ Mark the auction as Emailsend: true to prevent duplicate emails
                    auction.Emailsend = "true";
                    await auction.save();
                } else {
                    console.error(`❌ Failed to send email to ${findUser.email}`);
                }
            }

            await auction.save(); // Save auction changes
        }

        console.log(`✅ ${auctionsToEnd.length} auctions updated and emails sent.`);
    } catch (error) {
        console.error("❌ Error in auction status cron job:", error);
    }
});









