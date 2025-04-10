import PDFDocument from 'pdfkit';

export const generateOrderPdfBuffer = (user, order, products) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      const formatCurrency = amount => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2
        }).format(amount);
      };
      

      // Border
      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      doc.rect(40, 40, pageWidth - 80, pageHeight - 80).stroke();

      // Header
      doc.moveDown(0.5);
      doc.fontSize(26).font('Helvetica-Bold').text('INVOICE', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(14).font('Helvetica').text(`Order ID: ${order.OrderId}`, { align: 'center' });
      doc.moveDown(0.5);
      doc.fillColor('red').fontSize(12).text('PAY INVOICE', { align: 'center' });
      doc.fillColor('black').moveDown();
      doc.moveDown(0.5);
      // Billing
      doc.fontSize(12).font('Helvetica-Bold').text('Bill To:');
      doc.font('Helvetica').text(user.name || '');
      if (user.BillingDetails?.length > 0) {
        const b = user.BillingDetails[0];
        doc.text(b.company_name || '')
           .text(`${b.firstName || ''} ${b.lastName || ''}`.trim())
           .text(b.streetAddress || '')
           .text(`${b.city || ''}, ${b.state || ''}`)
           .text(b.zipcode || '')
           .text(`Phone: ${b.phone || ''}`)
           .text(`Email: ${b.email || ''}`);
      } else {
        doc.text("No billing details available.");
      }

    doc.moveDown(1);
      const invoiceDate = new Date(order.createdAt).toISOString().split('T')[0];
      const dueDate = new Date(new Date(order.createdAt).getTime() + 7 * 86400000).toISOString().split('T')[0];

      doc.font('Helvetica-Bold').text(`Invoice Date: `, { continued: true }).font('Helvetica').text(invoiceDate);
      doc.moveDown(0.5);

      // === Table Header ===
      doc.fontSize(12).font('Helvetica-Bold');
      const tableTop = doc.y;
      const positions = { index: 50, item: 80, qty: 390, amount: 470 };

      doc.text('#', positions.index, tableTop);
      doc.text('Item', positions.item, tableTop);
      doc.text('Qty', positions.qty, tableTop, { width: 40, align: 'right' });
      doc.text('Amount', positions.amount, tableTop, { width: 80, align: 'right' });
      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

      let y = tableTop + 25;
      doc.font('Helvetica');

      products.forEach((product, i) => {
        const orderProduct = order.products.find(p => p.product.toString() === product._id.toString());
        const qty = 1;
        const amount = orderProduct?.Offer_Amount || 0;

        if (y > 750) {
          doc.addPage();
          y = 50;
        }

        doc.text(i + 1, positions.index, y);
        doc.text(product.title, positions.item, y, { width: positions.qty - positions.item - 10 });
        doc.text(`${qty}`, positions.qty, y, { width: 40, align: 'right' });
        doc.text(formatCurrency(amount), positions.amount, y, { width: 80, align: 'right' });


        y += 25;
      });

      doc.moveTo(50, y).lineTo(550, y).stroke();
      y += 15;

      // === Totals Section ===
      const addTotalRow = (label, value) => {
        doc.font('Helvetica-Bold')
           .text(label, positions.qty, y, { width: 70, align: 'right' });
        doc.text(formatCurrency(value), positions.amount, y, { width: 80, align: 'right' });
        y += 20;
      };
      
      doc.moveDown(1);
      addTotalRow('Sub Total:', order.totalAmount);
      addTotalRow('Total:', order.totalAmount);


      doc.moveDown(3);
      doc.text('Signature _____________', { align: 'left'  });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
