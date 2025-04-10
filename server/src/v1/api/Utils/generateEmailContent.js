export const generateEmailContent = (user, updatedOrder, products) => {
    return `
      <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
        <h2 style="color: #4CAF50;">✅ Order Confirmation</h2>
        <p>Hi <strong>${user.name}</strong>,</p>
  
        <p>Thank you for your purchase! We're excited to share your order details:</p>
  
        <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <p><strong>Order ID:</strong> ${updatedOrder.OrderId}</p>
          <p><strong>Total Amount:</strong> $${updatedOrder.totalAmount.toFixed(2)}</p>
          <p><strong>Payment Status:</strong> ${updatedOrder.paymentStatus}</p>
          <p><strong>Order Date:</strong> ${new Date(updatedOrder.createdAt).toLocaleDateString()}</p>
        </div>
  
        <h3 style="margin-bottom: 10px;">🛍️ Products Ordered:</h3>
        ${products.map(p => {
          const orderProduct = updatedOrder.products.find(prod => prod.product.toString() === p._id.toString());
          return `
            <div style="display: flex; align-items: center; margin-bottom: 15px; border: 1px solid #eee; border-radius: 6px; padding: 10px;">
              <img src="${p.image[0]}" alt="${p.title}" style="width: 80px; height: auto; border-radius: 5px; margin-right: 15px;" />
              <div>
                <p style="margin: 0; font-size: 16px;"><strong>${p.title || "Unnamed Product"}</strong></p>
              </div>
            </div>
          `;
        }).join('')}
        <p style="margin-top: 30px;">Warm regards,<br><strong>The NY Elizabeth Team</strong></p>
      </div>
    `;
  };
  