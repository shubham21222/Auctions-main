import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config();


const stripe = new Stripe(process.env.STRIPE_KEY, {
    apiVersion: "2023-10-16",
  });


export default stripe;