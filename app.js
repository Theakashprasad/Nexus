const express = require("express");
const app = express();
const path = require("path");
const ejs = require("ejs");
const { v4: uuid4 } = require('uuid');
const session = require("express-session")
const db = require("./config/dbconnect")
const userroute = require("./routes/userroutes")
const adminrouter = require("./routes/adminrouter")
const paginate = require('express-paginate');

const port = 3001;
app.use(express.static(path.join(__dirname,"./public")));
// app.use(express.static(path.join(__dirname,"./views")));
app.set("view engine","ejs")

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
 

app.use(session({
  secret: 'your-secret-key', // Change this to a secure secret
  resave: false,
  saveUninitialized: false,
}));
app.use(paginate.middleware(10, 50));

app.use("/",userroute);
app.use("/admin",adminrouter);
app.get("*",(req,res)=>{
  res.render("user/404")
})
app.listen(3001,()=>{
    console.log(`Server is running on port ${port}`);
})
