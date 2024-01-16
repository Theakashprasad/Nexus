const addressDB = require("../../models/user/addressModel");
const user = require("../../models/user/usermodel");
const cartDB = require("../../models/user/cartModel");
const productDB = require("../../models/admin/productModel");
const orderDB = require("../../models/user/orderModel");
const couponDB = require('../../models/admin/couponModel');
const Razorpay = require('razorpay'); 

const checkout = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const addressID = req.query.id;
    console.log(addressID);
    req.session.address = false
    const addressColection = await addressDB.find({user:userId});
    await user.findByIdAndUpdate(
      userId,
      {
        addressId: addressID,
      },
      { new: true }
    );
    console.log("passed first update");

    const userDetails = await user.findById(userId); // used to find address from the user DB
    const addressId = userDetails.addressId; // userDb ->  addressID
    const addressData = await addressDB.findById(addressId);
    const addressDetails = addressData ?? "";
    const a = await cartDB.aggregate([
      {
         $match : {user : userId}
      },
      {
        $unwind : '$products'
      },{
        $lookup : 
        {
          from : 'products',
          localField : 'products.product',
          foreignField : '_id',
          as:'cartProduct'
        }
      }
    ])
    cartData = a ?? ''
        // console.log(JSON.stringify(cartData,null,2));
    // console.log(JSON.stringify(cartData,null,3));
    const productdetails = await productDB.find();
    const coupounData = await couponDB.find()   
    
    res.render("user/checkout.ejs", { 
      addressDetails,
      cartData,
      productdetails,
      addressColection,
      coupounData
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const checkoutPost = (req, res) => {};

const checkoutComplete = (req,res)=>{     
  res.render("user/checkoutComplete")
}

const razorpayPost = (req,res)=>{
    try {
      console.log(req.body.ordId);
        let amount= req.body.amount
        let addressId= req.session.user.addressId
   
        const a = process.env.RAZOR_ID
        const b = process.env.RAZOR_SECRET
        let instance = new Razorpay({ key_id:a, key_secret:  b })
        let options = {
            amount: Number(amount)*100,
            currency: "INR",
            receipt: "order_rcptid_11",
            notes: {
                key1: "value3",
                key2: "value2"
            }
        }
        // Creating the order
        instance.orders.create(options, function (err, order) {
            if (err) {
                console.error(err);
                res.status(500).send("Error creating order");
                return;
            }
            // Add orderprice to the response object
            res.send({ orderId: order.id , addressid:addressId });
        });
    } catch (error) {
        console.error("Razorpay post error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const confirmation = async (req,res)=>{
    try {
 
          const a = 'rzp_test_llt7AmvYnR8R68'
          const b = 'PhgoT6EHfKbw5rxJtQN6DJqY'  
            var instance = new Razorpay({ key_id: a, key_secret: b })
            let data = await instance.payments.fetch(req.body.razorpay_payment_id)
            const userId = req.session.user._id;
            const aa = await cartDB.findOne({ user: userId });
            cartData = aa ??''
            const totalAmount = data.notes.amount
            const ordId = data.notes.orderId 
            const copId = data.notes.copId 
            const addressId = await user.findById(userId)
            const addresData = await addressDB.findById(addressId.addressId) 

            const orderCreate = new orderDB({
              user: userId,
              products: cartData.products,
              totalAmount: totalAmount,
              discount : copId,
              shippingAddress: {
                full_name: addresData.full_name,
                address:addresData.address,
                city: addresData.city,
                state: addresData.state,
                zipcode: addresData.zipcode,
                country: addresData.country,
                phone: addresData.phone
            },
              paymentMethod: "ONLINE", 
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
                  product.size = c
                  product.save();
            })
           await cartDB.findByIdAndDelete(ordId)
        
            return res.redirect('/checkoutComplete')
        }
    catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error ' });
    }
};

const coupon =async(req,res)=>{
  try {
  
    const copValue = req.body.selectCpn ?? ''
    const price = req.body.price
    let copTotalPrice =0
    let message= ''
    let disPrice = 0
    const copData = await couponDB.findOne({
      couponName: copValue,
      minimumPurchase: { $lte: price }
    });
   console.log(copData);
    if(copData){
      if(copData.discountType == 'percentage'){
        copTotalPrice = Math.abs(((price * copData.couponValue )/100)-price)
         message = 'Copon offer '+copData.couponValue+'% discont to this product'
         disPrice = '-'+(price * copData.couponValue )/100
  }else{ 
    copTotalPrice =  Math.floor(Math.abs(copData.couponValue - price));
    console.log(copTotalPrice);
     message = 'Copon offer '+copData.couponValue+'$ discont to this product'
     disPrice = '-'+copData.couponValue
   }   
      res.json({pro:true,copTotalPrice,message,disPrice})
    }else{
      message = 'Coupon has expired'    
      res.json({pro:false , message })
    }
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error ' });
}
 
}

 
const checkoutFalure = (req,res)=>{ 
  res.render("user/checkoutFailure.ejs")
}

module.exports = {
  checkout,
  checkoutPost,
  checkoutComplete,
  razorpayPost,
  confirmation,
  coupon,
  checkoutFalure
};
