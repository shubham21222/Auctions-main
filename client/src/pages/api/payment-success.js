// pages/api/payment-success.js
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const { session_id, productId } = req.query;

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    const { userId, token } = session.metadata;

    const updateResponse = await fetch("https://bid.nyelizabeth.com/v1/api/auction/updatePaymentStatus", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
      },
      body: JSON.stringify({
        userId: userId,
        status: "PAID",
      }),
    });

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      throw new Error(errorData.message || "Failed to update payment status");
    }

    res.redirect(302, `/catalog/${productId}`);
  } catch (error) {
    console.error("Payment success error:", error);
    res.status(500).json({ error: error.message });
  }
}