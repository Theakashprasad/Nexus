const { json } = require("express");
const orderDB = require("../../models/user/orderModel");
const PDFDocument = require("../../PDF/PDFtable");
const invoiceGenerate = require("../../PDF/SalesPDF");

const salesReport = async (req, res) => {
  // const orderData = await orderDB.find();
  const orderProducts = await orderDB.aggregate([
    // aggreateing btw products order to get names
    {
      $unwind: "$products",
    },
    {
      $addFields: {
        productIndex: "$products.productIndex",
        sizeIndex: {
          $range: [0, { $size: "$products.size" }],
        },
      },
    },
    {
      $unwind: {
        path: "$products.size", //unwinds
        includeArrayIndex: "sizeIndex",
      },
    },
    {
      $match: {
        "products.size": {
          $ne: 0,
        },
      },
    },
    {
      //Hear we use look up to add both the DB
      $lookup: {
        from: "products",
        localField: "products.product",
        foreignField: "_id",
        as: "Allproducts",
      },
    },
  ]);
  console.log(JSON.stringify(orderProducts,null,2));
  res.render("admin/salesReport.ejs", { orderProducts });
};

const salesReportPDF = async (req, res) => {
  const orderProducts = await orderDB.aggregate([
    //use for the PDF page
    {
      $unwind: "$products",
    },
    {
      $addFields: {
        productIndex: "$products.productIndex",
        sizeIndex: {
          $range: [0, { $size: "$products.size" }],
        },
      },
    },
    {
      //unwind to get the size from the array
      $unwind: {
        path: "$products.size",
        includeArrayIndex: "sizeIndex",
      },
    },
    {
      $match: {
        //use match to match the produxt sieze
        "products.size": {
          $ne: 0,
        },
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "products.product",
        foreignField: "_id",
        as: "Allproducts",
      },
    },
  ]);

  const doc = new PDFDocument(); //sesding data to the PDF

  const pdfDoc = invoiceGenerate(doc, orderProducts);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'inline; filename="sales-details.pdf"');

  pdfDoc.pipe(res);

  // End the PDF document
  pdfDoc.end();

  console.log("jsdhhujsd  ");
};

module.exports = {
  salesReport,
  salesReportPDF,
};
