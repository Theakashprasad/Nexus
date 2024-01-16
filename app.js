require('dotenv').config();
const express = require("express");  //Npm express i
const app = express();   
const path = require("path");  //Path i
const ejs = require("ejs"); 
const { v4: uuid4 } = require('uuid');
const session = require("express-session")   //session
const db = require("./config/dbconnect")   // for Data base
const userroute = require("./routes/userroutes") //router connecting for the user
const adminrouter = require("./routes/adminrouter")  // router connecting for the admin
const paginate = require('express-paginate'); // i pagenation
const MongoDBStore = require('connect-mongodb-session')(session);


const port = 3001; //post number
app.use(express.static(path.join(__dirname,"./public")));  //makeing public static
// app.use(express.static(path.join(__dirname,"./views")));
app.set("view engine","ejs")  //seting MVC as 'ejs'

app.use(express.json());   //for the form data
app.use(express.urlencoded({ extended: false }));
 
var mongoDBStore = new MongoDBStore({
  uri: process.env.DB_CONNECT,
  collection: 'sessions',
  expires: 1000 * 60 * 60 * 24 * 30, // 30 days in milliseconds
}, err => {
  if (err) { 
    console.log("An error occured when connecting session to MongoDB");
    console.error(err);
  }
}) 

//session
app.use(session({
  secret: process.env.SESSION_SECRET, // Change this to a secure secret
  resave: false,
  store: mongoDBStore,
  saveUninitialized: false,
}));

app.use(paginate.middleware(10, 50));  //useing for the pagenation

app.use("/",userroute);   //user
app.use("/admin",adminrouter); //admin
app.get("*",(req,res)=>{   // 4 the 404 error page
  res.render("user/404")
})
app.listen(3001,()=>{  //server running local host
    console.log(`Server is running on port ${port}`);
})
