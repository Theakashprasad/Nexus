const orderDB = require("../../models/user/orderModel");
const cartDB = require("../../models/user/cartModel");
const productDB = require("../../models/admin/productModel");
const addressDb = require("../../models/user/addressModel");
const userDB = require("../../models/user/usermodel");
const {ObjectId} = require('mongodb')  

const orderMain = async(req,res)=>{

  const page = parseInt(req.query.page) || 1;
  const limit = 4;
  const startIndex = (page - 1) * limit;
  const totalProducts = await orderDB.countDocuments();
  const maxPage = Math.ceil(totalProducts / limit);
  if (page > maxPage) {
    return res.redirect(`/product?page=${maxPage}`);
  }

  try {
    const userId = req.session.user._id;
  
      const a = await orderDB.find({user:userId}).find() .limit(limit)
      .skip(startIndex)
      .exec();
  let orderDetails = a.reverse(); 
    // console.log(JSON.stringify(orderDetails,null,2));
    const addressData = await addressDb.find().find() .limit(limit)
    .skip(startIndex)
    .exec();
    const productData = await productDB.find().find() .limit(limit)
    .skip(startIndex)
    .exec();

    res.render("user/orderMain.ejs", {orderDetails,addressData,productData,page,maxPage })

  }  catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
  
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
    const products = await productDB.find();
    orderCreate.products.forEach((pro,i)=>{
        let product = products.find(item=>item._id.equals(pro.product))
        const a =product.size
        const b = pro.size
        let c = []
        for (let i = 0; i < a.length; i++) {
          c.push(a[i]-b[i])
        }
        console.log( c); 
          product.size = c
          product.save();
    })
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
    const ordData = await orderDB.findByIdAndUpdate(ordId,{
      Status:'CANCEL'
    });

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
