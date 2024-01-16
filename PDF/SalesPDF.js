function generateInvoice(doc, document) {
    const address = document.address;
  
    // Add the header - https://pspdfkit.com/blog/2019/generate-invoices-pdfkit-node/
    doc
      .fillColor("#444444")
      .fontSize(20)
      .text("Invoice", 0, 50, { align: "center" })
      .fontSize(8)
      // .text("To", 200, 50, { align: "right" })
      // .text(`${user.name}`, 200, 60, { align: "right" })
      // .text(`${address.houseName},${address.streetAddress}`, 200, 70, { align: "right" })
      // .text(`${address.city},${address.postalcode}`, 200, 80, { align: "right" })
      // .text(`${address.state}`, 200, 90, { align: "right" })
      .moveDown();
  
    // Create the table - https://www.andronio.me/2017/09/02/pdfkit-tables/
    const table = {
      headers: ["Sl no", "productName", "Size", "Quantity","Status", "Price", "Address"],
      rows: [],
    };
    let i = 0;
    let sizeVal = [6, 7, 8, 9];
    let totalOrderPrise = 0
      for (const each of document) {
  
        
        table.rows.push([
          ++i,
          each.Allproducts[0].product_name,
          sizeVal[each.sizeIndex],
          each.products.size,
          each.Status,
          each.products.price,
          each.shippingAddress.address,
        ]);
        totalOrderPrise = totalOrderPrise + (each.products.price * each.products.size)
      }
    
  
    // let total = document[0].totalAmount;
  
    table.rows.push(["", "", "", "", "" ,"total",totalOrderPrise ]);
  
    // Draw the table
    doc.moveDown().table(table, 10, 125, { width: 590 });
  
    return doc;
  }
  
  module.exports = generateInvoice;
  