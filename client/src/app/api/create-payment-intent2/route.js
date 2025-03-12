import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

export async function POST(req) {
  try {
    const { amount, currency, metadata, capture_method } = await req.json();
    console.log("Request body:", { amount, currency, metadata, capture_method });

    if (!amount || !currency) {
      return new Response(JSON.stringify({ error: "Missing required fields: amount or currency" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: currency || "usd",
      payment_method_types: ["card"],
      capture_method: capture_method || "automatic",
      description: `Remaining amount for product (Product ID: ${metadata?.productId || "unknown"})`,
      metadata: metadata || {},
    });

    console.log("Created Payment Intent:", {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      capture_method: paymentIntent.capture_method,
    });

    return new Response(JSON.stringify({ id: paymentIntent.id, client_secret: paymentIntent.client_secret }), {
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