import Stripe from "stripe";

// Initialize Stripe with your secret key
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
      const body = await req.json();
      console.log("Request body:", body);
      const { paymentIntentId, amountToCapture } = body;
  
      if (!paymentIntentId || !amountToCapture) {
        return new Response(
          JSON.stringify({ error: "Missing required fields" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
  
      // Capture the auction fee immediately
      const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId, {
        amount_to_capture: amountToCapture, // e.g., 10000 (which is $100.00)
      });
  
      console.log("Post-Capture Payment Intent:", {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        amount_capturable: paymentIntent.amount_capturable,
        amount_received: paymentIntent.amount_received,
      });
  
      return new Response(JSON.stringify({ success: true, paymentIntent }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Stripe Capture Error:", err.message, err.stack);
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }