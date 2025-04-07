import newlettermodel from "../../models/newsLetter/newsletter.model.js"
import { success, created, notFound, badRequest, unauthorized, forbidden, serverValidation, unknownError, validation, alreadyExist, sendResponse, invalid, onError } from '../../../../../src/v1/api/formatters/globalResponse.js';



import { sendEmail } from  "../../Utils/sendEmail.js"


// create a new newsletter //

export const createNewsletter = async (req, res) => {
    try {
        const newsletterData = await newlettermodel.create(req.body);

        const mailOptions = {
            to: newsletterData.email,
            subject: 'Welcome to the Auction – Let the Bidding Begin! 🕒🔨',
            html: `
              <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
                <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 25px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
                  <h2 style="color: #222;">Hey ${newsletterData.firstName},</h2>
                  <p style="font-size: 16px; color: #555;">
                    Thanks for signing up for our newsletter! 📨 You're now part of a vibrant auction community where every bid counts.
                  </p>
                  <p style="font-size: 16px; color: #555;">
                    Get ready to:
                  </p>
                  <ul style="color: #555; font-size: 16px; line-height: 1.6;">
                    <li>⚡ Participate in live and timed auctions</li>
                    <li>📦 Discover rare and exclusive items</li>
                    <li>📣 Receive real-time updates on auctions and events</li>
                    <li>🏆 Win big with smart bidding strategies</li>
                  </ul>
                  <p style="font-size: 16px; color: #555;">
                    Stay tuned—our next auction is just around the corner!
                  </p>
                  <a href="https://bid.nyelizabeth.com/" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 6px;">
                    🔥 Browse Live Auctions
                  </a>
                  <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                  <p style="font-size: 13px; color: #999;">
                    If you didn’t sign up for this newsletter, you can safely ignore this email.<br>
                    Happy Bidding!<br>
                    – The Auction Team
                  </p>
                </div>
              </div>
            `
          };
          
        await sendEmail(mailOptions);
       return success(res, 'Newsletter created successfully', newsletterData);
    } catch (error) {
        if (error.name === 'ValidationError') {
           return badRequest(res , error.message)
        } else {
           return unknownError(res, error.message);
        }
    }
}


// get all newsletters //
export const getAllNewsletters = async (req, res) => {
    try {
        const newsletters = await newlettermodel.find({}).sort({ createdAt: -1 });
        return success(res, 'Newsletters fetched successfully', newsletters);
    } catch (error) {
        return unknownError(res, error.message);
    }
}


// get newsletter by id //


export const getNewsletterById = async (req, res) => {
    try {
        const newsletter = await newlettermodel.findById(req.params.id);
         if(!newsletter){
            return badRequest(res, 'Newsletter not found');
         }
        return success(res, 'get successfully', newsletter);
    } catch (error) {
      return unknownError(res, error.message);
    }
}



// update newsletter by id //

export const updateNewsletterById = async (req, res) => {
    try {
        const newsletter = await newlettermodel.findByIdAndUpdate(req.params.id, req.body, { new: true });
         if(!newsletter){
            return badRequest(res, 'Newsletter not found');
         }
    } catch (error) {
        if (error.name === 'ValidationError') {
            return badRequest(res, error.message);
        } else {
           return badRequest(res , error)
        }
    }
}


// delete newsletter by id //

export const deleteNewsletterById = async (req, res) => {
    try {
        const newsletter = await newlettermodel.findByIdAndDelete(req.params.id);
        if(!newsletter) {
            return badRequest(res, 'Newsletter not found');
        }
        return success(res, 'Newsletter deleted successfully', newsletter);
    } catch (error) {
        return unknownError(res, error.message);
    }
}