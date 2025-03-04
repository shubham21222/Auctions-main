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
    const body = await req.json();
    console.log("Request body:", body); // Log for debugging
    const { line_items, mode, success_url, cancel_url, metadata } = body;

    if (!line_items || !mode || !success_url || !cancel_url) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: line_items, mode, success_url, or cancel_url" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode,
      success_url,
      cancel_url,
      metadata: metadata || {},
    });

    return new Response(JSON.stringify({ id: session.id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Stripe Checkout Error:", err.message, err.stack); // Enhanced logging
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export const config = {
  api: {
    bodyParser: true, // Ensure body parsing is enabled
  },
};