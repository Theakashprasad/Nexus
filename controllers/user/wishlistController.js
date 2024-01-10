const wishlistDB = require('../../models/user/wishlistModel');
const productDB = require('../../models/admin/productModel')

const wishlist = async(req,res)=>{
    try {
        
    const userId = req.session.user._id
    const wishlistData = await wishlistDB.findOne({user:userId})
    const productData = await productDB.find()
    res.render('user/wishlist.ejs',{wishlistData,productData}) 
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
 
module.exports = {
    wishlist,
    wishlistPost,
    wishlistRemove
}