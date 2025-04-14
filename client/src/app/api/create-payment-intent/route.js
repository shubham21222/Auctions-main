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

    // Get the base URL from the request headers
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const host = req.headers.get('host');
    const baseUrl = `${protocol}://${host}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency || 'usd',
            product_data: {
              name: `NY Elizabeth ${metadata?.tier || 'Membership'}`,
              description: `Annual membership for ${metadata?.tier || 'Tier'}`,
              images: ['https://beta.nyelizabeth.com/wp-content/uploads/2024/03/p1.png'], // Add your logo URL here
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/exclusive-access?success=true`,
      cancel_url: `${baseUrl}/exclusive-access?canceled=true`,
      metadata: metadata || {},
      billing_address_collection: 'required',
      customer_email: metadata?.email || undefined,
    });

    console.log("Created Checkout Session:", session.id);
    return new Response(JSON.stringify({ sessionId: session.id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Stripe Checkout Session Error:", error.message, error.stack);
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