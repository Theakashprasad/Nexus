const orderDB = require("../../models/user/orderModel");
const productDB = require("../../models/admin/productModel");
const addressDb = require("../../models/user/addressModel");
const userDB = require("../../models/user/usermodel");

const order = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 4;
    const startIndex = (page - 1) * limit;
    const totalProducts = await orderDB.countDocuments();
    const maxPage = Math.ceil(totalProducts / limit);
    if (page > maxPage) {
      return res.redirect(`/product?page=${maxPage}`);
    }
    const orderData = await orderDB.find().limit(limit)
    .skip(startIndex)
    .exec();

    res.render("admin/order", { orderData, page, maxPage });
    
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const orderView = async (req, res) => {
  try {
    const orderId = req.params.ordId;
    const orderDetails = await orderDB.findById(orderId); // o
    const a = orderDetails.shippingAddress
    const addressDetails = await addressDb.findOne(a); //ad
    const userDetails = await userDB.findOne(orderDetails.user); // used to find address from the user DB
    const productIdData = orderDetails.products;
    const productData = await productDB.find();
    res.render("admin/orderViewPage.ejs", {
      userDetails,
      addressDetails,
      orderDetails,
      productData,
      productIdData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const orderPost = async (req, res) => {
  try {
    const statusValue = req.body.selectedValue;
    const orderId = req.body.orderId;
    const proId = req.body.proId;
    const ordData = await orderDB.findByIdAndUpdate(orderId,{
      Status:statusValue
    },
    {new: true})
    console.log(ordData);

    // const a = ordData.products.filter((value) => {
    //   return value.product == proId;
    // });
    // a[0].Status= statusValue
    // ordData.save();

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  order,
  orderView,
  orderPost,
};
