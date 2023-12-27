const addressDB = require("../../models/user/addressModel");
const user = require("../../models/user/usermodel");
const cartDB = require("../../models/user/cartModel");
const productDB = require("../../models/admin/productModel");
const order = require("../../models/user/orderModel");

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
        console.log(JSON.stringify(cartData,null,2));

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

module.exports = {
  checkout,
  checkoutPost,
  checkoutComplete
};
