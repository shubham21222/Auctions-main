// calendar.service.js (ES6 module)
import { google } from 'googleapis';
import auctionModel from '../../models/Auction/auctionModel.js';
import User from "../../models/Auth/User.js"
import { sendAuctionInviteEmail } from "../../Utils/sendEmail.js"
const OAuth2 = google.auth.OAuth2;
const oAuth2Client = new OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

async function loadTokens() {
  const tokens = {
    access_token: process.env.ACCESS_TOKEN,
    refresh_token: process.env.REFRESH_TOKEN,
    expiry_date: parseInt(process.env.EXPIRY_DATE, 10),
  };
  oAuth2Client.setCredentials(tokens);
  return tokens;
}

async function saveTokens(tokens) {
  process.env.ACCESS_TOKEN = tokens.access_token;
  process.env.REFRESH_TOKEN = tokens.refresh_token;
  process.env.EXPIRY_DATE = tokens.expiry_date.toString();
}

async function refreshAccessTokenIfNeeded() {
  const tokens = await loadTokens();
  if (Date.now() >= tokens.expiry_date) {
    try {
      const { credentials } = await oAuth2Client.refreshAccessToken();
      oAuth2Client.setCredentials(credentials);
      await saveTokens(credentials);
    } catch (err) {
      console.error('Token refresh error:', err);
      throw new Error('Unable to refresh token');
    }
  }
}

export async function createAuctionCalendarEvent(auctionId, user) {
    try {
      // Refresh access token if expired
      await refreshAccessTokenIfNeeded();
  
      // Fetch the auction and populate the creator info
      const auction = await auctionModel.findById(auctionId).populate('createdBy auctionProduct');
      if (!auction) throw new Error('Auction not found');

      const Userdata = await User.findById(user).select('email')
      if(!Userdata){
        throw new Error("User not found")
      }
  
      const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
  
      // Set start and end times (2-hour default duration)
      const eventStartTime = new Date(auction.startDate);
      const eventEndTime = new Date(eventStartTime.getTime() + 2 * 60 * 60 * 1000);
  
      const event = {
        summary: `Auction: ${auction?.auctionProduct.title}`,
        location: 'Online',
        description: auction.description || `Auction hosted by ${auction.createdBy?.name || 'Admin'}.`,
        start: {
          dateTime: eventStartTime.toISOString(),
          timeZone: 'Asia/Kolkata',
        },
        end: {
          dateTime: eventEndTime.toISOString(),
          timeZone: 'Asia/Kolkata',
        },
        attendees: [
          { email: Userdata.email }, 
        ],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 60 },
            { method: 'popup', minutes: 30 },
          ],
        },
      };
  
      const eventResponse = await calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        sendUpdates: 'all', // ensures email invite goes out
      });
  
      console.log('Calendar event created for user:', Userdata.email);
  
      // Send the auction invite email to the user
      await sendAuctionInviteEmail(auction , Userdata.email);
  
    } catch (err) {
      console.error('Failed to create auction event for user:', err.message);
      throw err;
    }
  }
  
