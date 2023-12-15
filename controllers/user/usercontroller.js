const userDB = require("../../models/user/usermodel");
const bcrypt = require("bcrypt");
const sendOtp = require("../../helper/otp");
const productDB = require("../../models/admin/productModel");
const orderDB = require("../../models/user/orderModel");
const addressDb = require("../../models/user/addressModel");

//test for checking purpose
const a = async (req, res) => {
  const id = "656045f2cc6f67b592c2fcc9";
  const user = await productDB.findById(id);
  res.render("user/a", { user });
};

// ++++++++++++++++++++++++++++++++++++++++++++++++   HOME   ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

const home = (req, res) => {
  res.render("user/home.ejs");
};

// ++++++++++++++++++++++++++++++++++++++++++++++++   LOGOUT   ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

const logout = (req, res) => {
  req.session.user = null;
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      res.status(500).send("Error destroying session");
    } else {
      res.redirect("/login");
    }
  });
};

// ++++++++++++++++++++++++++++++++++++++++++++++++   SIGN UP   ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

const signup = (req, res) => {
  if (req.session.invalid) {
    req.session.invalid = false;
    res.render("user/signup.ejs", { message: req.session.errmsg });
  } else {
    res.render("user/signup.ejs", { message: "" });
  }
};

const usersignup = async (req, res) => {
  try {
    let data = req.body;
    const check = await userDB.findOne({ email: req.body.email }); //data from the DB

    if (check) {
      //cheking if there is any user signedup befor
      req.session.invalid = true;
      req.session.errmsg = "Email Already exists";
      return res.redirect("/signup");
    } else {
      const saltRound = 10; //bcrypting the code for securety
      const hashpassword = await bcrypt.hash(data.password, saltRound);
      data.password = hashpassword;

      const generateOTP = () => {
        // generating a 6 digit otp number
        return Math.floor(1000 + Math.random() * 900000); // Generate a 6-digit OTP
      };
      let otp = generateOTP();
      console.log(otp);
      let email = data.email;
      // predetermin email
      email = "akashprasadyt123@gmail.com";
      sendOtp(email, otp);

      const added = new userDB({
        //adding new user into the DB
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.number,
        otp: otp,
      });
      console.log(added);
      if (!added) {
        //checking if is is added
        return res.redirect("/signup");
      }

      await added.save(); //saving
      route = "otp"
      req.session.otp = false
      res.redirect("/otp");
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send("Error creating USER");
  }
};

// ++++++++++++++++++++++++++++++++++++++++++++++++   LOGIN US   ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

const login = (req, res) => {
  const sessionCheck = req.session.user;
  if (sessionCheck) {
    res.redirect("/");
  } else {
    if (req.session.invalid) {
      req.session.invalid = false;
      res.render("user/login.ejs", { message: req.session.errmsg });
    } else {
      res.render("user/login.ejs", { message: "" });
    }
  }
};

const userLogin = async (req, res) => {
  const email = req.body.email;
  // console.log('body0',email);
  const data = await userDB.findOne({ email: email });
  // console.log('user is',user);
  try {
    if (data) {
      //checking if the user exits
      if (data.blocked === false) {
        //checking if the user is blocked or not
        const isPasswordMatch = await bcrypt.compare(
          req.body.password,
          data.password
        ); //compareing both bcrypt password and password
        if (isPasswordMatch) {
          req.session.user = data;
          res.redirect("/"); //if the login suuces then redirect to the home page
        } else {
          req.session.invalid = true;
          req.session.errmsg = "password is INcorrect";
          return res.redirect("/login");
        }
      } else {
        req.session.invalid = true;
        req.session.errmsg = "user has been blocked";
        return res.redirect("/login");
      }
    } else {
      req.session.invalid = true;
      req.session.errmsg = "user is not registered";
      return res.redirect("/login");
    }
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).send("fetch error:check once more");
  }
};

// ++++++++++++++++++++++++++++++++++++++++++++++++   OTP   ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

const otp = (req, res) => {
  if(req.session.user){
    res.redirect("/");
  }
  else{
    if (req.session.invalid) {
      req.session.invalid = false;
      res.render("user/otp.ejs", { message: req.session.errmsg });
    } else {
      res.render("user/otp.ejs", { message: "" });
    }
  }
};

const userOtp = async (req, res) => {
  try {
    const otpNum = req.body.otp; //requiring otp from the user
    const check = await userDB.findOne({ otp: otpNum }); //checking if the otp exist
    if (check) {
      if (req.session.otp) {
        console.log(req.session.otp);
        res.redirect("/forgetCheck");
      }else{
        res.redirect("/");
      }
    } else {
      req.session.invalid = true;
      req.session.errmsg = "Invalid otp";
      return res.redirect("/otp");
    }
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).send("fetch error:check once more");
  }
};

// ++++++++++++++++++++++++++++++++++++++++++++++++    SHOP   ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

const shop = async (req, res) => {
  try {
    const data = await productDB.find();
    res.render("user/shop.ejs", { data });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).send("fetch error:check once more");
  }
};

// ++++++++++++++++++++++++++++++++++++++++++++++++   PRODUCT   ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

const product = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await productDB.findById(userId);
    res.render("user/product.ejs", { user });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).send("fetch error:check once more");
  }
};

const user = async (req, res) => {
  try {
    const addressID = req.query.id;
    const userId = req.session.user._id;
    req.session.address = true
    const orderDetails = await orderDB.find({user:userId});
    const userDetails = await userDB.findById(userId); // used to find address from the user DB
    const addressId = userDetails.addressId;
    let addressDetails = await addressDb.findById(addressId);
    addressDetails = addressDetails??''
    const addressData = await addressDb.find();
    const productData = await productDB.find();
    // userDetails  addressDetails
    res.render("user/user.ejs", {
      userDetails,
      orderDetails,
      addressData,  
      productData,
      addressDetails,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const editUser = async (req,res)=>{
  const userId = req.session.user._id; 
  let img;
  if (req.file === undefined) {
    //if the image does not added
     img = "";
  } else {
    //image added
    img = req.file.filename;
  }
  const data = await userDB.findById(userId)
const a = await userDB.findByIdAndUpdate(userId,{
 name: req.body.name ,
phone:req.body.phone,
gender:req.body.gender,
user_img_url: img == "" ? data.user_img_url : img ,
},{new:true})
 res.redirect("/user")
}

const changePassword = (req,res)=>{
  if(req.session.invalid){
    req.session.invalid = false;
    res.render("user/changePassword",{message : req.session.errMsg})
  }else{
    res.render("user/changePassword",{message : ""})
  }
}


const changePasswordPost = async(req,res)=>{
  const userId = req.session.user._id; 
  const data = await userDB.findById(userId)
  const isPasswordMatch = await bcrypt.compare(
    req.body.currentPassword,
    data.password
    );
    
    if(isPasswordMatch){
      const saltRound = 10; //bcrypting the code for securety
      const hashpassword = await bcrypt.hash(req.body.newPassword, saltRound);
      await userDB.findByIdAndUpdate(userId,{
        password:hashpassword
      })      
      res.redirect("/user")
    }else{
     req.session.invalid = true
     req.session.errMsg = " Password is incorect"
     res.redirect("/changePassword")
    }
 
}






module.exports = {
  a,
  signup,
  usersignup,
  login,
  userLogin,
  logout,
  home,
  otp,
  userOtp,
  shop,
  product,
  user,
  editUser,
  changePassword,
  changePasswordPost
};
