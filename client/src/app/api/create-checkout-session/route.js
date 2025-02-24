import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-01-27.acacia",
});

export async function POST(req) {
  const body = await req.json();
  const { line_items, mode, success_url, cancel_url, metadata } = body;

  try {
    const session = await stripe.checkout.sessions.create({
      line_items,
      mode,
      success_url,
      cancel_url,
      metadata,
    });
    return new Response(JSON.stringify({ id: session.id }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400 });
  }
}