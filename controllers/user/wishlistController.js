const wishlistDB = require('../../models/user/wishlistModel');
const productDB = require('../../models/admin/productModel');
const cartDB = require('../../models/user/cartModel');
const { ObjectId } = require('mongodb');

const wishlist = async(req,res)=>{
    try {
        
    const userId = req.session.user._id
    const wishlistData = await wishlistDB.findOne({user:userId})
    const productData = await productDB.find()
    let cart = await cartDB.findOne({user:userId})
    let cartData
    console.log(cart);
     if(cart){
          cartData = cart.products 
     }
    res.render('user/wishlist.ejs',{wishlistData,productData,cartData}) 
    }  catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
      }
}
const wishlistPost = async(req,res)=>{
    try {
        if(!req.session.user){
            res.json({session : true})
        }else{
            const userId = req.session.user._id
            const proId = req.body.productId
            const wishlistData = await wishlistDB.findOne({user:userId}) 
            if(wishlistData){ 
                wishlistData.products.push({
                    product: proId
                })
                wishlistData.save()
    
            }else{
                const wishlistSave = new wishlistDB({
                    user: userId,
                    products: [{              
                        product: proId
                    }]
                })
                wishlistSave.save();
            } 
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
      }
   
}


const wishlistRemove = async(req,res)=>{
    try {
        const wishId = req.params.proId
        const userId = req.session.user._id
      
       await wishlistDB.updateOne(
         { user: userId },
         { $pull: { products: { product: wishId } } }
       );
       
         res.redirect("/wishlist")
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
      }
  
}


const addToCart = async(req,res)=>{
    try {
     const proId = req.body.productId
      const a = await cartDB.find()
      const convertedObjectId = new ObjectId(proId);   
      const userId = req.session.user._id;
      const cartData = await cartDB.findOne({user:userId})  
      const ifExist = await cartDB.findOne({
        'products': { $elemMatch: { product: proId } }
      });

      if(ifExist){
           
      }else{
        let arr = [0, 0, 0, 0]; 
        arr[0] = 1
        cartData.products.push({
          product : proId,
          size : arr 
        });
        cartData.save(); 
      }
    res.json({success:true})
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
      }
 }
 
module.exports = {
    wishlist,
    wishlistPost,
    wishlistRemove,
    addToCart
}