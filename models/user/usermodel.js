const mongoose = require("mongoose");

const logInSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,

    },
    blocked: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: Number,
      required: false,
    },
    gender:{
     type : String
    },
    user_img_url: {
      type: String,
    },
    otp: {
      type: String,
    },
    otpCreated: {
      type: Date,
    },    
     addressId:{
      type: mongoose.Schema.Types.ObjectId,
   } ,
   coupon:[
    {
      type:String
    }
  ] ,
  referal :{
    type : Number,
  }
  
  },
  {
    timestamps: true,
  },
);
  
module.exports = mongoose.model("user", logInSchema);
