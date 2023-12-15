const mongoose = require("mongoose");
require('dotenv').config()
// ++++++++++++++++++++++++++++++++++++++++++++++++    DATA BASE CONNECTION  ++++++++++++++++++++++++++++++++++++++++++++++++++
const url=process.env.DB_CONNECT
mongoose.connect(url).then(()=>{
    console.log("mongodb had connected");
}).catch(()=>{
    console.log("mongodb has not connected");
})
