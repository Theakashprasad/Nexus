const mongoose = require("mongoose");
const { Schema } = mongoose;

const addressSchema = new mongoose.Schema(

    {
    user: {
            type:Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
    full_name:{
        type:String,
        required: true,
    },
    address:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required:true
    },
    city:{
        type:String,
        required:true
    },
    country:{
        type:String,
        required:true
    },
    state:{
        type:String,
        required:true
    },
    zipcode:{
        type:Number,
        required:true
    }
})

module.exports = mongoose.model("address", addressSchema);
