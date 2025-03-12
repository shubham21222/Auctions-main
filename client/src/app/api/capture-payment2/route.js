import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2022-11-15" });

export async function POST(req) {
  try {
    const { paymentIntentId } = await req.json();
    if (!paymentIntentId) {
      return new Response(JSON.stringify({ error: "Missing paymentIntentId" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);
    console.log("Captured Payment Intent:", { id: paymentIntent.id, status: paymentIntent.status, amount: paymentIntent.amount });
    return new Response(JSON.stringify(paymentIntent), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Capture Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}