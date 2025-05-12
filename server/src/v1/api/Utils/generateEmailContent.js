export const generateEmailContent = (user) => {
  return `
    <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
      <h2 style="color: #4CAF50;">📨 Thank You for Submitting Your Offer</h2>
      <p>Hi <strong>${user.name}</strong>,</p>

      <p>Thank you for submitting your offer. At this time, your offer is under review.</p>

      <p>If it is accepted, you will receive an invoice by email with instructions to complete your payment within 2 business days. 
      Please be sure to check your spam or junk folder, as the invoice will be sent from 
      <a href="mailto:billing@nyelizabeth.com" style="color: #4CAF50;">billing@nyelizabeth.com</a>.</p>

      <p>If your offer is not accepted, your $100 deposit will be promptly refunded.</p>

      <p>We appreciate your interest and look forward to assisting you.</p>

      <p style="margin-top: 30px;">Warm regards,<br><strong>The NY Elizabeth Team</strong></p>
      <p>
        <a href="https://www.nyelizabeth.com" style="color: #4CAF50;">www.nyelizabeth.com</a><br>
        <a href="mailto:hello@nyelizabeth.com" style="color: #4CAF50;">hello@nyelizabeth.com</a>
      </p>
    </div>
  `;
};



export const generateShippingStatusEmail = (status, userName) => {
  const commonFooter = `
    <p style="margin-top: 30px;">Congratulations and warm regards,<br><strong>The NY Elizabeth Team</strong></p>
    <p>
      <a href="https://www.nyelizabeth.com" style="color: #4CAF50;">www.nyelizabeth.com</a><br>
      <a href="mailto:hello@nyelizabeth.com" style="color: #4CAF50;">hello@nyelizabeth.com</a>
    </p>
  `;

  switch (status) {
    case "Processing":
      return {
        subject: "Offer Approved - Next Steps",
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
            <p>Hi <strong>${userName}</strong>,</p>
            <p>Thank you for submitting your offer. Your offer has been approved. You will receive an invoice by email with instructions to complete your payment within 2 business days. 
            Please be sure to check your spam or junk folder, as the invoice will be sent from <a href="mailto:billing@nyelizabeth.com">billing@nyelizabeth.com</a>.</p>
            ${commonFooter}
          </div>
        `,
      };

    case "Shipped":
      return {
        subject: "Your Order Has Shipped",
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
            <p>Hi <strong>${userName}</strong>,</p>
            <p>Your order has shipped. You will receive a tracking notification from the shipping carrier. 
            In most cases, shipments require a signature upon delivery.</p>
            ${commonFooter}
          </div>
        `,
      };

    case "Cancelled":
      return {
        subject: "Offer Declined - Refund in Progress",
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
            <p>Hi <strong>${userName}</strong>,</p>
            <p>Thank you for submitting your offer. We have declined your offer. You will receive your $100 deposit back on your card within 7 business days.</p>
            ${commonFooter}
          </div>
        `,
      };

    case "Delivered":
      return {
        subject: "Your Package Has Been Delivered",
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
            <p>Hi <strong>${userName}</strong>,</p>
            <p>Your package has been delivered.</p>
            ${commonFooter}
          </div>
        `,
      };

    default:
      return null;
  }
};

