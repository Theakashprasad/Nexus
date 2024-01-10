const mongoose = require('mongoose')


const adminLoginSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
});
 adminCollection =  mongoose.model('admin',adminLoginSchema)
module.exports=adminCollection