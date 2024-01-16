const couponDB = require("../../models/admin/couponModel");
const moment=require('moment')
// ++++++++++++++++++++++++++++++++++++++++++++++++COUPON MANAGEMENT++++++++++++++++++++++++++++++++++++++++++++++++++

const coupon = async(req,res)=>{ 
  try {
    const page = parseInt(req.query.page) || 1;  //pagenation caode
    const limit = 5;
    const startIndex = (page - 1) * limit;

    const totalProducts = await couponDB.countDocuments();

    const maxPage = Math.ceil(totalProducts / limit);
    if (page > maxPage) {
      return res.redirect(`/product?page=${maxPage}`);  //checkig the page size
    }

      const curentDate = new Date;   //to get the current date
      const coupondata = await couponDB.find({validTo:{$gte:curentDate}}).limit(limit)  //limit
      .skip(startIndex)  
      .exec();//fetching data form DB which are only blocked === false //check that if the coupon is validate or not
        res.render('admin/coupon.ejs',{coupondata , page , maxPage})
        
  }  catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).send("fetch error:check once more");
  }
}

const couponPost = async(req,res)=>{
try {
  const {couponName,couponValue,couponMinimumPurchase,validFrom,validTo,discountType}=req.body  //geting the form data
  // console.log(couponName,couponValue,couponMinimumPurchase,validFrom,validTo,discountType,"error"); //testing data

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
    let couponData ;
    if(req.session.invalid ){
      req.session.invalid =false
      message = req.session.errmsg
      let copId = req.params.copId     //get the copon id
      couponData = await couponDB.findById(copId) //sotoring the copon data
      console.log(couponData);
      res.render('admin/editcoupon.ejs',{couponData,message:message})
      console.log('error');

    }else{
     copId = req.params.copId     //get the copon id
     couponData = await couponDB.findById(copId) //sotoring the copon data
   
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
  // console.log(couponName,couponValue,couponMinimumPurchase,validFrom,validTo,discountType,"updated coupon")
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
    res.redirect('back')
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