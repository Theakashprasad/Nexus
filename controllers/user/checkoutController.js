const addressDB = require("../../models/user/addressModel");
const user = require("../../models/user/usermodel");
const cartDB = require("../../models/user/cartModel");
const productDB = require("../../models/admin/productModel");
const orderDB = require("../../models/user/orderModel");
const Razorpay = require('razorpay');

const checkout = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const addressID = req.query.id;
    req.session.address = false
    const addressColection = await addressDB.find({user:userId});
    await user.findByIdAndUpdate(
      userId,
      {
        addressId: addressID,
      },
      { new: true }
    );
    const userDetails = await user.findById(userId); // used to find address from the user DB
    const addressId = userDetails.addressId; // userDb ->  addressID
    const addressData = await addressDB.findById(addressId);
    addressDetails = addressData ?? "";
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
    res.render("user/checkout.ejs", { 
      addressDetails,
      cartData,
      productdetails,
      addressColection
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
      console.log('j');
        let amount= req.body.amount
        let addressId= req.session.user.addressId
        console.log(addressId);
        const a = 'rzp_test_llt7AmvYnR8R68'
        const b = 'PhgoT6EHfKbw5rxJtQN6DJqY'
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
        if (!req.body.razorpay_payment_id) {
            const userId = req.session.userId;
            const productDetails = req.body.orderDetails;
            // console.log("cd product ", productDetails);
            const paymentMode = req.body.paymentMode
            const orderNumber = generateOrderNumber();
            const total = calculateTotal(productDetails);
            const address = await addressCollection.findById(req.body.addressid)
            const currentstatus = "pending"
            const newOrder = new orderCollection({
                userId,
                productdetails: productDetails,
                Ordernumber: orderNumber,
                total,
                address,
                payment: paymentMode,
                status: currentstatus

            });
            await newOrder.save();
            await cartCollection.deleteMany({});
            res.status(200).json({ success: true, message: 'Order placed successfully!' });
        } else {
          const a = 'rzp_test_llt7AmvYnR8R68'
          const b = 'PhgoT6EHfKbw5rxJtQN6DJqY'  
            var instance = new Razorpay({ key_id: a, key_secret: b })
            let data = await instance.payments.fetch(req.body.razorpay_payment_id)
            const userId = req.session.user._id;
            const aa = await cartDB.findOne({ user: userId });
            cartData = aa ??''
            const totalAmount = data.notes.amount
            const ordId = data.notes.orderId 
            const addressId = await user.findById(userId)
            console.log(addressId);
            const orderCreate = new orderDB({
              user: userId,
              products: cartData.products,
              totalAmount: totalAmount,
              shippingAddress: addressId.addressId,
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
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error ' });
    }
};

module.exports = {
  checkout,
  checkoutPost,
  checkoutComplete,
  razorpayPost,
  confirmation
};
