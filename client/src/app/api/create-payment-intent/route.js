import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

export async function POST(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { amount, currency, metadata } = await req.json();
    console.log("Request body:", { amount, currency, metadata });

    if (!amount || !currency) {
      return new Response(JSON.stringify({ error: "Missing required fields: amount or currency" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount, // In cents
      currency: currency || "usd",
      payment_method_types: ["card"],
      capture_method: "manual", // Hold payment, don’t capture
      metadata: metadata || {},
      description: `Bid payment for auction item (Auction ID: ${metadata?.auctionId || "unknown"})`,
    });

    console.log("Created PaymentIntent:", paymentIntent.id);
    return new Response(JSON.stringify({ clientSecret: paymentIntent.client_secret }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Stripe Payment Intent Error:", error.message, error.stack);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};