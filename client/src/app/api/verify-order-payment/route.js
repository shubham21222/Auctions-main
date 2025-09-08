import Stripe from "stripe";
import config from "@/app/config_BASE_URL";
  
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');

  if (!orderId) {
    return Response.json({ error: "Missing orderId" }, { status: 400 });
  }

  try {
    // Fetch order details from your backend
    const orderResponse = await fetch(`${config.baseURL}/v1/api/order/getOrderById?_id=${orderId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Add authorization token if required by your backend
        // "Authorization": `Bearer ${process.env.BACKEND_API_TOKEN}`,
      },
    });

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json();
      throw new Error(errorData.message || "Failed to fetch order details");
    }

    const orderData = await orderResponse.json();
    console.log("Order Data:", orderData);

    const paymentIntentId = orderData.items?.paymentIntentId; // Adjust based on your order schema

    if (!paymentIntentId) {
      // Fallback: Search Stripe for PaymentIntents with matching metadata
      const paymentIntents = await stripe.paymentIntents.list({
        limit: 10, // Adjust as needed
        // Filter by metadata if your backend doesn't store paymentIntentId
        // Note: Stripe doesn't support direct metadata filtering in the API; you'd need to fetch and filter manually
      });

      const matchingIntent = paymentIntents.data.find(
        (intent) => intent.metadata.orderId === orderId
      );

      if (!matchingIntent) {
        throw new Error("No PaymentIntent found for this order");
      }

      console.log("Matching PaymentIntent from Stripe:", matchingIntent);
      return Response.json(matchingIntent, { status: 200 });
    }

    // Fetch PaymentIntent directly if ID is available
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    console.log("Retrieved PaymentIntent:", paymentIntent);

    return Response.json(paymentIntent, { status: 200 });
  } catch (error) {
    console.error("Error verifying order payment:", error.message, error.stack);
    return Response.json({ error: "Failed to verify payment", details: error.message }, { status: 500 });
  }
}