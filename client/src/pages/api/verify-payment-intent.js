import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { paymentIntentId } = req.query;

  if (!paymentIntentId) {
    return res.status(400).json({ error: "Missing paymentIntentId" });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    console.log("Retrieved PaymentIntent:", paymentIntent);
    return res.status(200).json(paymentIntent);
  } catch (error) {
    console.error("Error verifying PaymentIntent:", error.message, error.stack);
    return res.status(500).json({ error: "Failed to verify payment" });
  }
}