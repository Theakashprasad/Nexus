const orderDB = require("../../models/user/orderModel");
const productDB = require("../../models/admin/productModel");
const addressDb = require("../../models/user/addressModel");
const userDB = require("../../models/user/usermodel");

const order = async (req, res) => {
  try {
    const orderData = await orderDB.find();
    res.render("admin/order", { orderData });
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
    console.log(a );
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
    const ordData = await orderDB.findById(orderId)
    console.log(ordData.products);

    const a = ordData.products.filter((value) => {
      return value.product == proId;
    });
    a[0].Status= statusValue
    ordData.save();
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
