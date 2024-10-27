const addressDB = require("../../models/user/addressModel");
const user = require("../../models/user/usermodel");
const cartDB = require("../../models/user/cartModel");
const productDB = require("../../models/admin/productModel");
const orderDB = require("../../models/user/orderModel");
const couponDB = require("../../models/admin/couponModel");
const Razorpay = require("razorpay");

const checkout = async (req, res) => {
  try {
    const userId = req.session.user._id; //use ID
    req.session.address = false; //make it false for rendering purpose
    const addressColection = await addressDB.find({ user: userId });

    console.log("passed first update");

    const userDetails = await user.findById(userId); // used to find address from the user DB
    const addressId = userDetails.addressId; // userDb ->  addressID
    const addressData = await addressDB.findById(addressId);
    const addressDetails = addressData ?? "";
    const a = await cartDB.aggregate([
      {
        $match: { user: userId },
      },
      {
        $unwind: "$products",
      },
      {
        $lookup: {
          from: "products",
          localField: "products.product",
          foreignField: "_id",
          as: "cartProduct",
        },
      },
    ]);
    cartData = a ?? "";
    // console.log(JSON.stringify(cartData,null,2));
    // console.log(JSON.stringify(cartData,null,3));
    const productdetails = await productDB.find();
    const curentDate = new Date(); //to get the current date
    const coupounData = await couponDB.find({ validTo: { $gte: curentDate } })
 

    res.render("user/checkout.ejs", {
      addressDetails,
      cartData,
      productdetails,
      addressColection,
      coupounData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const checkoutPost = (req, res) => {};

const checkoutComplete = (req, res) => {
  res.render("user/checkoutComplete");
};

const razorpayPost = (req, res) => {
  try {
    let amount = req.body.amount;
    let addressId = req.session.user.addressId; //addres id

    const a = process.env.RAZOR_ID; //RAZOR PAY ID
    const b = process.env.RAZOR_SECRET; //RAZOR PAY  SC
    let instance = new Razorpay({ key_id: a, key_secret: b });
    let options = {
      amount: Number(amount) * 100,
      currency: "INR",
      receipt: "order_rcptid_11",
      notes: {
        key1: "value3",
        key2: "value2",
      },
    };
    // Creating the order
    instance.orders.create(options, function (err, order) {
      if (err) {
        console.error(err);
        res.status(500).send("Error creating order");
        return;
      }
      // Add orderprice to the response object
      res.send({ orderId: order.id, addressid: addressId });
    });
  } catch (error) {
    console.error("Razorpay post error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const confirmation = async (req, res) => {
  try {
    const a = process.env.RAZOR_ID; //RAZOR PAY ID
    const b = process.env.RAZOR_SECRET; //RAZOR PAY  SC
    var instance = new Razorpay({ key_id: a, key_secret: b });
    let data = await instance.payments.fetch(req.body.razorpay_payment_id);
    const userId = req.session.user._id;
    const aa = await cartDB.findOne({ user: userId }); //cart db
    cartData = aa ?? "";
    const totalAmount = data.notes.amount; //amount to be saved
    const ordId = data.notes.orderId; //order id
    const copId = data.notes.copId; //cop id
    const addressId = await user.findById(userId);
    const addresData = await addressDB.findById(addressId.addressId);

    const orderCreate = new orderDB({
      //saving the order data
      user: userId,
      products: cartData.products,
      totalAmount: totalAmount,
      discount: copId,
      shippingAddress: {
        full_name: addresData.full_name,
        address: addresData.address,
        city: addresData.city,
        state: addresData.state,
        zipcode: addresData.zipcode,
        country: addresData.country,
        phone: addresData.phone,
      },
      paymentMethod: "ONLINE",
    });
    await orderCreate.save();
    const products = await productDB.find();
   
      orderCreate.products.forEach((pro, i) => {
        //product db
        let product = products.find((item) => item._id.equals(pro.product.valueOf()));
        

        const a = product.size;
        const b = pro.size;
        let c = [];
        for (let i = 0; i < a.length; i++) {
          c.push(a[i] - b[i]);
        } 
        product.size = c;
        product.save();
      });
    await cartDB.findByIdAndDelete(ordId); //to delete the cart db

    return res.redirect("/checkoutComplete");
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ success: false, message: "Internal Server Error " });
  }
};

const coupon = async (req, res) => {
  try {
    const copValue = req.body.selectCpn ?? ""; //useing null collsing to check
    const price = req.body.price; //price
    let copTotalPrice = 0;
    let message = "";
    let disPrice = 0;
    const copData = await couponDB.findOne({
      couponName: copValue,
      minimumPurchase: { $lte: price },
    });

    if (copData) {
      if (copData.discountType == "percentage") {
        // copTotalPrice = Math.abs((price * copData.couponValue) / 100 - price);
        copTotalPrice = Math.floor(Math.abs((price * copData.couponValue) / 100 - price));

        message =
          "Copon offer " + copData.couponValue + "% discont to this product";
        disPrice = "-" + (price * copData.couponValue) / 100;
      } else {
        copTotalPrice = Math.floor(Math.abs(copData.couponValue - price));

        message =
          "Copon offer " + copData.couponValue + "$ discont to this product";
        disPrice = "-" + copData.couponValue;
      }
      res.json({ pro: true, copTotalPrice, message, disPrice });
    } else {
      message = "Coupon has expired";
      res.json({ pro: false, message });
    }
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ success: false, message: "Internal Server Error " });
  }
};

const checkoutFalure = (req, res) => {
  res.render("user/checkoutFailure.ejs");
};

const checkoutAddress  = async(req , res)=>{
  const userId = req.session.user._id; //use ID
  const addressID = req.body.addressId
   await user.findByIdAndUpdate(
    userId,
    {
      addressId: addressID,
    },
    { new: true }
  ); 

  const addressData = await addressDB.findById(addressID)
  console.log(addressData); 
  res.json({data:addressData})

}



module.exports = {
  checkout,
  checkoutPost,
  checkoutComplete,
  razorpayPost,
  confirmation,
  coupon,
  checkoutFalure,
  checkoutAddress
};
