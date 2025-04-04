export const generateEmailContent = (user, updatedOrder, products) => {
    return `
        <h1 style="color: #4CAF50;">Order Confirmation - Thank You for Your Purchase!</h1>
        <p>Dear ${user.name},</p>

        <p>We are thrilled to confirm your order! Here are the details:</p>

        <ul>
            <li><strong>Order ID:</strong> ${updatedOrder.OrderId}</li>
            <li><strong>Total Amount:</strong> $${updatedOrder.totalAmount}</li>
            <li><strong>Payment Status:</strong> ${updatedOrder.paymentStatus}</li>
            <li><strong>Order Date:</strong> ${new Date(updatedOrder.createdAt).toLocaleDateString()}</li>
        </ul>

        <h2>📝 Products Ordered</h2>
        <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; width: 100%;">
            <thead>
                <tr>
                    <th>Image</th>
                    <th>Product Name</th>
                    <th>Remark</th>
                    <th>Offer Amount (in $)</th>
                </tr>
            </thead>
            <tbody>
                ${products.map(p => `
                    <tr>
                        <td><img src="${p.image}" alt="${p.name}" style="width: 100px; height: auto;"></td>
                        <td>${p.name || "Unnamed Product"}</td>
                        <td>${updatedOrder.products.find(prod => prod.product.toString() === p._id.toString())?.Remark || "No Remark Provided"}</td>
                        <td>${(p.offerAmount / 100).toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <p>Thank you for choosing us. We hope to serve you again soon!</p>

        <p>Best regards,<br>
        Your Company Name</p>
    `;
}
