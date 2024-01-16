const orderDB = require("../../models/user/orderModel");
const cartDB = require("../../models/user/cartModel");
const productDB = require("../../models/admin/productModel");
const addressDb = require("../../models/user/addressModel");
const userDB = require("../../models/user/usermodel");
const couponDB = require("../../models/admin/couponModel");
const walletDB = require("../../models/user/wallet");
const { ObjectId } = require("mongodb"); 
const PDFDocument = require('../../PDF/PDFtable');
const invoiceGenerate = require('../../PDF/invoice');

const orderMain = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 7;
  const startIndex = (page - 1) * limit;
  const totalProducts = await orderDB.countDocuments();
  const maxPage = Math.ceil(totalProducts / limit);
  if (page > maxPage) {
    return res.redirect(`/product?page=${maxPage}`);
  }

  try {
    const userId = req.session.user._id;

    const a = await orderDB
      .find({ user: userId })
      .limit(limit)
      .skip(startIndex)
      .exec();
    let orderDetails = a.reverse();
    // console.log(JSON.stringify(orderDetails,null,2));
    const addressData = await addressDb.find();
    const productData = await productDB.find();

    res.render("user/orderMain.ejs", {
      orderDetails,
      addressData,
      productData,
      page,
      maxPage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const order = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const orderId = req.params.ordId;
    const userDetails = await userDB.findById(userId); // used to find address from the user DB
    const addressId = userDetails.addressId;
   
    const orderDetails = await orderDB.findById(orderId);
    const productIdData = orderDetails.products;
    const productData = await productDB.find();
    const couponData = orderDetails.discount
    res.render("user/order.ejs", {
      userDetails,
      orderDetails,
      productData,
      productIdData,
      couponData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const orderPost = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const a = await cartDB.findOne({ user: userId });
    cartData = a ?? "";
    const totalAmount = req.body.subtotalAttributeValue;
    const ordId = req.body.ordId;
    const copId = req.body.copId;
    console.log(copId);
    const addressId = await userDB.findById(userId); 
    const addresData = await addressDb.findById(addressId.addressId)
    const orderCreate = new orderDB({
      user: userId,
      products: cartData.products,
      totalAmount: totalAmount,
      discount: copId,
      shippingAddress: {
        full_name: addresData.full_name,
        address:addresData.address,
        city: addresData.city,
        state: addresData.state,
        zipcode: addresData.zipcode,
        country: addresData.country,
        phone: addresData.phone
    },
      paymentMethod: "COD",
    });
    await orderCreate.save();
    const products = await productDB.find();
    orderCreate.products.forEach((pro, i) => {
      let product = products.find((item) => item._id.equals(pro.product));
      const a = product.size;
      const b = pro.size;
      let c = [];
      for (let i = 0; i < a.length; i++) {
        c.push(a[i] - b[i]);
      }
      // console.log(c);
      product.size = c;
      product.save();
    });
    await cartDB.findByIdAndDelete(ordId);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const orderCancel = async (req, res) => {
  try {
    const proId = req.body.proId;
    const ordId = req.body.ordId;
    const statusValue = req.body.statusValue;
    const ordData = await orderDB.findById(ordId);

    // NOT COD
    if (!(ordData.paymentMethod === "COD" && ordData.Status === "CANCEL")) {
      const amount = req.body.amount.slice(1);
      const proId = req.body.proId;
      const ordId = req.body.ordId;
      const userId = req.session.user._id;
      const walletData = await walletDB.findOne({ user: userId });
      let balance = 0;

      if (walletData) {
        balance = Number(walletData.balance) + Number(amount);
        const newHistoryEntry = {
          amount: amount,
          status: "CREDIT",
          orderId: ordId,
        };
        const updateQuery = {
          $set: { balance: balance },
          $push: { history: newHistoryEntry },
        };

        const result = await walletDB.updateOne({ user: userId }, updateQuery);
      } else {
        balance = amount;

        const wallet = new walletDB({ 
          user: userId,
          balance: balance,
          history: [
            {
              amount: amount,
              status: "CREDIT",
              orderId: ordId,
            },
          ],
        });
        await wallet.save();
      }
    }

    if (statusValue == "RETURN") {
      await orderDB.findByIdAndUpdate(ordId, {
        Status: "RETURN",
      });
    } else {
      //cancel
const products = await productDB.find();
    ordData.products.forEach((pro, i) => {
      let product = products.find((item) => item._id.equals(pro.product));
      const b = pro.size;
      const a = product.size;
      let c = [];
      for (let i = 0; i < a.length; i++) {
        c.push(a[i] + b[i]);
      }
      product.size = c;
      product.save();
      console.log(product.size);
    });

      await orderDB.findByIdAndUpdate(ordId, {
        Status: "CANCEL",
      });
    }
    

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const invoice = async(req,res)=>{
  try {

    const order_id = req.params.id
    const userId = req.session.user._id;

    const user = await userDB.findById(userId )
    const o = await orderDB.findById(order_id)
    const p = await productDB.find()
    const orderProducts = await orderDB.aggregate([
      {
        $match: {
          _id: new ObjectId(order_id)
        }
      },
      {
        $unwind: '$products'
      },
      {
        $addFields: {
          productIndex: '$products.productIndex',
          sizeIndex: {
            $range: [
              0,
              { $size: '$products.size' }
            ]
          }
        }
      },
      {
        $unwind: {
          path: '$products.size',
          includeArrayIndex: 'sizeIndex'
        }
      },
      {
        $match: {
          'products.size': {
            $ne: 0
          }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'products.product',
          foreignField: '_id',
          as: 'Allproducts'
        }
      }
    ]);
    
      //  console.log(JSON.stringify(o,null,2));
      //  console.log(JSON.stringify(p,null,2));

      console.log('order products printing')
       console.log(orderProducts);


    const doc = new PDFDocument();

    const pdfDoc = invoiceGenerate(doc, orderProducts, user)

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'inline; filename="sales-details.pdf"');

    pdfDoc.pipe(res);

    // End the PDF document
    pdfDoc.end();



} catch (e) {
    console.log(e)
    res.redirect('/404-not-found')
}

}



module.exports = {
  orderMain,
  order,
  orderPost,
  orderCancel,
  invoice,
};
