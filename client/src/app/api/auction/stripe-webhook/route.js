// // app/api/auction/stripe-webhook/route.js
// import Stripe from "stripe";

// // Initialize Stripe with your secret key (use env vars in production)
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
//   apiVersion: "2025-01-27.acacia",
// });
// const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// export async function POST(req) {
//   const sig = req.headers.get("stripe-signature"); // Use .get() for Headers API
//   let event;

//   console.log("Received Stripe-Signature:", sig);
//   console.log("Using Endpoint Secret:", endpointSecret);

//   try {
//     // Get raw body as a string directly from the request
//     const rawBody = await req.text(); // No need for 'micro' or buffer
//     console.log("Raw Body:", rawBody);

//     // Construct the event with rawBody as a string
//     event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
//     console.log("Constructed Event:", event);

//     // Handle the event
//     switch (event.type) {
//       case "payment_intent.created":
//         const paymentIntentCreated = event.data.object;
//         console.log("Payment Intent Created:", paymentIntentCreated.id);
//         break;
//       case "payment_intent.payment_failed":
//         const paymentIntentFailed = event.data.object;
//         console.log("Payment Failed:", paymentIntentFailed.id, paymentIntentFailed.last_payment_error?.message);
//         break;
//       case "payment_intent.succeeded":
//         const paymentIntentSucceeded = event.data.object;
//         console.log("Payment Succeeded:", paymentIntentSucceeded.id);
//         break;
//       default:
//         console.log(`Unhandled event type: ${event.type}`);
//     }

//     return new Response(JSON.stringify({ received: true }), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (err) {
//     console.error("Webhook Error:", err.message);
//     return new Response(JSON.stringify({ error: err.message }), {
//       status: 400,
//       headers: { "Content-Type": "application/json" },
//     });
//   }
// }

// // No need for config object to disable bodyParser in App Router
// export async function POST(req) {
//   const sig = req.headers["stripe-signature"];
//   let event;

//   console.log("Received Stripe-Signature:", sig); // Log signature
//   console.log("Using Endpoint Secret:", endpointSecret); // Log secret for verification

//   try {
//     // Get raw body for signature verification
//     const rawBody = await buffer(req);
//     console.log("Raw Body:", rawBody.toString()); // Log raw body

//     event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
//     console.log("Constructed Event:", event); // Log successful event

//     // Handle the event
//     switch (event.type) {
//       case "payment_intent.created":
//         const paymentIntentCreated = event.data.object;
//         console.log("Payment Intent Created:", paymentIntentCreated.id);
//         break;

//       case "payment_intent.payment_failed":
//         const paymentIntentFailed = event.data.object;
//         console.log("Payment Failed:", paymentIntentFailed.id, paymentIntentFailed.last_payment_error?.message);
//         break;

//       case "payment_intent.succeeded":
//         const paymentIntentSucceeded = event.data.object;
//         console.log("Payment Succeeded:", paymentIntentSucceeded.id);
//         break;

//       default:
//         console.log(`Unhandled event type: ${event.type}`);
//     }

//     return new Response(JSON.stringify({ received: true }), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (err) {
//     console.error("Webhook Error:", err.message);
//     return new Response(JSON.stringify({ error: err.message }), {
//       status: 400,
//       headers: { "Content-Type": "application/json" },
//     });
//   }
// }

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };



import Stripe from "stripe";

// Initialize Stripe with your secret key (use env vars in production)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-01-27.acacia",
});
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
  const sig = req.headers.get("stripe-signature"); // Use .get() for Headers API
  let event;

  console.log("Received Stripe-Signature:", sig);
  console.log("Using Endpoint Secret:", endpointSecret);

  try {
    // Get raw body as a string directly from the request
    const rawBody = await req.text(); // No need for 'micro' or buffer
    console.log("Raw Body:", rawBody);

    // Construct the event with rawBody as a string
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    console.log("Constructed Event:", event);

    // Handle the event
    switch (event.type) {
      case "payment_intent.created":
        const paymentIntentCreated = event.data.object;
        console.log("Payment Intent Created:", paymentIntentCreated.id);
        break;
      case "payment_intent.payment_failed":
        const paymentIntentFailed = event.data.object;
        console.log("Payment Failed:", paymentIntentFailed.id, paymentIntentFailed.last_payment_error?.message);
        break;
      case "payment_intent.succeeded":
        const paymentIntentSucceeded = event.data.object;
        console.log("Payment Succeeded:", paymentIntentSucceeded.id);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook Error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// No need for config object to disable bodyParser in App Router