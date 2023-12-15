const orderDB = require("../../models/user/orderModel");
const cartDB = require("../../models/user/cartModel");
const productDB = require("../../models/admin/productModel");
const addressDb = require("../../models/user/addressModel");
const userDB = require("../../models/user/usermodel");

const orderMain = async(req,res)=>{

  const userId = req.session.user._id;
  const orderDetails = await orderDB.find({user:userId});
  const addressData = await addressDb.find();
  const productData = await productDB.find();

    res.render("user/orderMain.ejs", {orderDetails,addressData,productData})

}

const order = async (req, res) => {
  try {
    
    const userId = req.session.user._id;
    const orderId = req.params.ordId;
    const userDetails = await userDB.findById(userId); // used to find address from the user DB
    const addressId = userDetails.addressId;
    let addressDetails = await addressDb.findById(addressId);
    addressDetails = addressDetails ?? ''
    const orderDetails = await orderDB.findById(orderId);
    const productIdData = orderDetails.products;
    const productData = await productDB.find();
    res.render("user/order.ejs", {
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
    const userId = req.session.user._id;
    const a = await cartDB.findOne({ user: userId });
    cartData = a ??''
    const totalAmount = req.body.subtotalAttributeValue;
    const ordId = req.body.ordId
    const addressId = await userDB.findById(userId)
    const orderCreate = new orderDB({
      user: userId,
      products: cartData.products,
      totalAmount: totalAmount,
      shippingAddress: addressId.addressId,
      paymentMethod: "COD",
    });
    await orderCreate.save();
   await cartDB.findByIdAndDelete(ordId)


  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const orderCancel = async (req, res) => {
  try {
    
    const proId = req.body.proId;
    const ordId = req.body.ordId
    const ordData = await orderDB.findById(ordId);

    const a = ordData.products.filter((value) => {
      return value.product == proId;
    });
    a[0].Status= 'CANCEL'
    ordData.save();
    res.json({ success: true });
   

  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  orderMain,
  order,
  orderPost,
  orderCancel,
};
