const sendOtp = require("../../helper/otp") 
const userDB = require("../../models/user/usermodel")
const bcrypt = require("bcrypt");



const forgetPassword = (req,res)=>{

    res.render("user/forgetPassword")
}
const forgetPasswordPost = async (req,res)=>{
 try {
  const emailId = req.body.email
  req.session.emailId = emailId
  const data = await userDB.findOne({email : emailId})
  if(data){
const generateOTP = () => {
      // generating a 6 digit otp number
      return Math.floor(1000 + Math.random() * 900000); // Generate a 6-digit OTP
    };
    let otp = generateOTP();
    email = "akashprasadyt123@gmail.com";
    sendOtp(email, otp);
    data.otp = otp
    console.log(otp);
    data.save()
   req.session.otp = true
       res.redirect("/otp");
  }else{
     res.send("no")
  }
 }  catch (error) {
  console.error(error);
  res.status(500).send("Internal Server Error");
}

}

const forgetCheck = (req,res)=>{
  res.render("user/forgetCheck")
}

const forgetCheckPost = async (req,res)=>{
     try {
      const email = req.session.emailId
  
      console.log(req.session.emailId );
     const saltRound = 10; //bcrypting the code for securety
     const hashpassword = await bcrypt.hash(req.body.newPassword, saltRound);
     const a = await userDB.updateOne({email:email}, { $set: { password: hashpassword } })

     console.log(a);      
     res.redirect("/login")
     }  catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
     
}

module.exports = {
    forgetPassword,
    forgetPasswordPost,
    forgetCheck,
    forgetCheckPost
}