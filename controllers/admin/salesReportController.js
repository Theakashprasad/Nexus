const { json } = require("express");
const orderDB = require("../../models/user/orderModel");
const PDFDocument = require("../../PDF/PDFtable");
const invoiceGenerate = require("../../PDF/SalesPDF");

const salesReport = async (req, res) => {
  // const orderData = await orderDB.find();
  let dateFrom =0;
  let dateTo =0;
   let orderProducts
   let dateFromn =0
   let dateTon =0
  if(req.query.dateFrom){
    dateFromn = req.query.dateFrom
    dateTon = req.query.dateTo
   if(dateFromn>=dateTon){ 
    res.render("admin/salesReport.ejs", { orderProducts:[] , message : 'erooe' ,dataFrom : dateFrom,dataTo :dateTo})
   }
     dateFrom = new Date(dateFromn);
       dateTo = new Date(dateTon);
       console.log(dateFrom,dateTo);
 orderProducts = await orderDB.aggregate([
  {
    $match: {
      Status: "DEVLIVERED",
    }
  },
  {
     $match: {
      "createdAt": {
        $gte: dateFrom,
        $lte: dateTo,
      }
    } 
  },
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
      path: "$products.size",
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
    $lookup: {
      from: "products",
      localField: "products.product",
      foreignField: "_id",
      as: "Allproducts",
    },
  },
  {
    $group: {
      _id: {
        orderId: "$_id",
        productIndex: "$productIndex",
      },
      orderDetails: { $first: "$$ROOT" },
      products: { $push: "$Allproducts" },
    },
  },
  {
    $replaceRoot: { newRoot: "$orderDetails" },
  },
  {
    $sort: {
      createdAt: -1, // Sort in descending order based on createdAt
    },
  },
]); 
  }else{
 orderProducts = await orderDB.aggregate([
  {
    $match: {
      Status: "DEVLIVERED",
    }
  }
  ,
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
      path: "$products.size",
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
    $lookup: {
      from: "products",
      localField: "products.product",
      foreignField: "_id",
      as: "Allproducts",
    },
  },

  {
    $group: {
      _id: {
        orderId: "$_id",
        productIndex: "$productIndex",
      },
      orderDetails: { $first: "$$ROOT" },
      products: { $push: "$Allproducts" },
    },
  },
  {
    $replaceRoot: { newRoot: "$orderDetails" },
  },
  {
    $sort: {
      createdAt: -1, // Sort in descending order based on createdAt
    },
  },
 
]);
  }
  // console.log(JSON.stringify(orderProducts,null,2)); 

    res.render("admin/salesReport.ejs", { orderProducts , message : '' ,dataFrom : dateFromn,dataTo :dateTon});
  
};
 
const salesReportPDF = async (req, res) => {
     let datafrom 
     let datato 
     let orderProducts
     
     dateFromn = req.query.datafrom
     dateTon = req.query.datato
     dateFrom = new Date(dateFromn);
     dateTo = new Date(dateTon);
     if(req.query.datafrom){
    
      orderProducts = await orderDB.aggregate([
        {
           $match: {
            "createdAt": {
              $gte: dateFrom,
              $lte: dateTo,
            }
          } 
        },
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
            path: "$products.size",
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
          $lookup: {
            from: "products",
            localField: "products.product",
            foreignField: "_id",
            as: "Allproducts",
          },
        },
        {
          $group: {
            _id: {
              orderId: "$_id",
              productIndex: "$productIndex",
            },
            orderDetails: { $first: "$$ROOT" },
            products: { $push: "$Allproducts" },
          },
        },
        {
          $replaceRoot: { newRoot: "$orderDetails" },
        },
        {
          $sort: {
            createdAt: -1, // Sort in descending order based on createdAt
          },
        },
      ]);
     }
     else{

       orderProducts = await orderDB.aggregate([

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
        {
          $sort: {
            createdAt: -1, // Sort in descending order based on createdAt
          },
        },
      ]);
    
     }
  const doc = new PDFDocument(); //sesding data to the PDF

  const pdfDoc = invoiceGenerate(doc, orderProducts);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'inline; filename="sales-details.pdf"');

  pdfDoc.pipe(res);

  // End the PDF document
  pdfDoc.end();

};

module.exports = {
  salesReport,
  salesReportPDF,
};
