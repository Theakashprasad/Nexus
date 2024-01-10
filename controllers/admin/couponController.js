const couponDB = require("../../models/admin/couponModel");
const moment=require('moment')
// ++++++++++++++++++++++++++++++++++++++++++++++++COUPON MANAGEMENT++++++++++++++++++++++++++++++++++++++++++++++++++

const coupon = async(req,res)=>{
  try {

      const curentDate = new Date;   //to get the current date
      const coupondata = await couponDB.find({validTo:{$gte:curentDate}}); //check that if the coupon is validate or not
        res.render('admin/coupon.ejs',{coupondata})
        
  }  catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).send("fetch error:check once more");
  }
}

const couponPost = async(req,res)=>{
try {
  const {couponName,couponValue,couponMinimumPurchase,validFrom,validTo,discountType}=req.body  //geting the form data
  console.log(couponName,couponValue,couponMinimumPurchase,validFrom,validTo,discountType,"error"); //testing data

    const isCouponAvailable=await couponDB.findOne({couponName:couponName}) //find the coupon exiting or not
   
    if(!isCouponAvailable){ //makes true to false
      // add the coupom
      const addCoupon= new couponDB({
        couponName:couponName,
        couponValue:couponValue,
        minimumPurchase:couponMinimumPurchase,
        discountType:discountType,
        validFrom:moment(validFrom).format('YYYY-MM-DD'),
        validTo:moment(validTo).format('YYYY-MM-DD')
      })
    
      await addCoupon.save()
      return  res.status(200).json({sucess:"ok"})
    }else{
      let errorMsg="already exist"
     return res.status(400).json({error:errorMsg}) //validation if the coupon does not exits
    }
}   catch (error) {
  console.error("Error creating user:", error);
  return res.status(500).send("fetch error:check once more");
}
}

const editCoupon = async(req,res)=>{
  try {
    if(req.session.invalid ){
      req.session.invalid =false
      message = req.session.errmsg
      res.render('admin/coupon.ejs',{coupondata,message:message})
      console.log('error');

    }else{
    const copId = req.params.copId     //get the copon id
    const couponData = await couponDB.findById(copId) //sotoring the copon data
    console.log(couponData);
    res.render('admin/editcoupon.ejs',{couponData,message:''}) // rendering the copon data
    }
  }  catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).send("fetch error:check once more");
  }

}

const editCouponPost = async(req,res)=>{
  try {
    
  const couponId = req.params.copId    //get the copon id
  const {couponName,couponValue,couponMinimumPurchase,validFrom,validTo,discountType}=req.body  //extracting data form the form data
  console.log(couponName,couponValue,couponMinimumPurchase,validFrom,validTo,discountType,"updated coupon")
  const isCouponAvailable=await couponDB.findOne({couponName:couponName}) //find the coupon exiting or not
   if(!isCouponAvailable){
    const isCouponUpdated = await couponDB.findOneAndUpdate( //updateing the coupon , 'edting'
    { _id:couponId },
    {
      $set: {
        couponName,
        couponValue,
        couponMinimumPurchase,
        validFrom,
        validTo,
        discountType
      }
    }
  )
  res.redirect('/admin/coupon')
   }else{
    req.session.invalid = true
    req.session.errmsg = "alredy exist"
    res.redirect('/admin/coupon')

   }


  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).send("fetch error:check once more");
  }
}

const deleteCoupon = async(req,res)=>{
  const copId = req.params.copId
  const couponData  = await couponDB.findByIdAndDelete(copId)
  console.log(couponData);
  res.redirect('/admin/coupon')

}



module.exports = {
    coupon,
    couponPost,
    editCoupon,
    editCouponPost,
    deleteCoupon
}