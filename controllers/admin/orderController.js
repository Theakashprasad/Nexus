const orderDB = require("../../models/user/orderModel");
const productDB = require("../../models/admin/productModel");
const addressDb = require("../../models/user/addressModel");
const userDB = require("../../models/user/usermodel");

// ++++++++++++++++++++++++++++++++++++++++++++++++ORDER MANAGEMENT++++++++++++++++++++++++++++++++++++++++++++++++++

const order = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; //pagenation code
    const limit = 4;
    const startIndex = (page - 1) * limit;
    const totalProducts = await orderDB.countDocuments();
    const maxPage = Math.ceil(totalProducts / limit);
    if (page > maxPage) {
      return res.redirect(`/product?page=${maxPage}`); //checking if the page is gte
    }
    const a = await orderDB
      .find()
      .limit(limit) //limiting the data
      .skip(startIndex)
      .exec();
      const orderData  = a.reverse()
    const userdata = await userDB.find(); //find the data 

    res.render("admin/order", { orderData, userdata, page, maxPage }); //rendering the page
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const orderView = async (req, res) => {
  try {
    const orderId = req.params.ordId; //order id
    const orderDetails = await orderDB.findById(orderId); // o
    const a = orderDetails.shippingAddress;
    const addressDetails = await addressDb.findOne(a); //ad
    const userId = orderDetails.user.valueOf();
    const userDetails = await userDB.findById(userId); // used to find address from the user DB
    const productIdData = orderDetails.products;
    const productData = await productDB.find();
    res.render("admin/orderViewPage.ejs", {
      //rendering all data
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
    const statusValue = req.body.selectedValue; //selected value => pen,can,deliv,acc
    const orderId = req.body.orderId; //id of the ord
    const proId = req.body.proId;
    const ordData = await orderDB.findByIdAndUpdate(
      orderId,
      {
        //updating the odere
        Status: statusValue,
      },
      { new: true }
    );
    console.log(ordData);

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
