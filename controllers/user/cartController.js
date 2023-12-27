const cartDB = require("../../models/user/cartModel");
const productDB = require("../../models/admin/productModel");
const {ObjectId} = require('mongodb')
const { product } = require("./usercontroller");
const { populate } = require("../../models/user/usermodel");

const cart = async (req, res) => {
  try {
    const userId = new ObjectId(req.session.user._id)  
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
    checkUser = a ?? ''
    // console.log('b4 cart data')
    // console.log(JSON.stringify(checkUser,null,2));
    const productdetails = await productDB.find()
    res.render("user/cart.ejs", { checkUser, productdetails });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const cartPost = async (req, res) => {
  try {
    const productId = req.body.productId;
    const selectedSize =req.body.selectedSize;
    const userId = req.session.user._id;
    const checkUser = await cartDB.findOne({ user: userId });
    const productdetails = await productDB.find();
    let productDetails;
    let produtIndex;
    if (selectedSize) {
    if (checkUser) {
      let cartSize
      cartSize = checkUser.products.filter((value)=>{
        return productId == value.product
      })
      if(cartSize.length == 0){
        // console.log( checkUser.products[0].size[2] );
        // console.log(selectedSize);
          let arr = [0, 0, 0, 0]; 
          arr[selectedSize] = 1
          checkUser.products.push({
            product : productId,
            size : arr 
          });
            checkUser.save();

      }else{
       cartSize[0].product = productId
       cartSize[0].size[selectedSize] += 1    
       checkUser.save();  
      } 
    } else {
      const newUser = new cartDB({
        user: userId,
        products: [   
          {
            product: productId,
          },
        ],
      });
      newUser.products[0].size[selectedSize] = 1;
      await newUser.save();
    }   
   }else{
     req.session.size= true;
      res.json({succes:true})
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const updateCart = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const productId = req.body.productId;
    const qnt = req.body.qnt;
    const sizeInx = req.body.sizeInx;
    const productQnt = await productDB.findById(productId)
    const productSizeQnt = productQnt.size[sizeInx];
    const userData = await cartDB.findOne({ user: userId });
    const a = userData.products.filter((value) => {
      return value.product == productId; 
    });
    let cartSizeQnt =  a[0].size[sizeInx]
    if (productSizeQnt <= cartSizeQnt) {
      a[0].size[sizeInx] = productQnt.product_qty;
      userData.save();
      res.json({stock:true})
    }else{ 
      a[0].size[sizeInx] = qnt;
      userData.save();
      res.json({stock:false})
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const removeCart = async (req, res) => {
  try {    
    const userId = req.session.user._id
    const proId = req.body.reoveId
    const sizeIdx = req.body.size

   await cartDB.findOneAndUpdate(
    { user:  userId, 'products.product': proId },
    { $set: { [`products.$.size.${sizeIdx}`]: 0 } },
    { new: true })
   
     res.json({sucess:true})
 
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  cart,
  cartPost,
  updateCart,
  removeCart,
};
