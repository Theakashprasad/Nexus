const userDB = require("../../models/user/usermodel");
const bcrypt = require("bcrypt");
const sendOtp = require("../../helper/otp");
const productDB = require("../../models/admin/productModel");
const orderDB = require("../../models/user/orderModel");
const addressDb = require("../../models/user/addressModel");
const cartDb = require("../../models/admin/catagoryModel");
const walletDB = require("../../models/user/wallet");
const { ObjectId } = require("mongodb");
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');


//test for checking purpose
const a = async (req, res) => {
  const a = await walletDB.find();
  console.log(JSON.stringify(a, null, 2));
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
      let referalBOL = false;
      let refExistingOrNot;
      if (data.referal) {
        refExistingOrNot = await userDB.findOne({ referal: data.referal });
        if (!refExistingOrNot) {
          req.session.invalid = true;
          req.session.errmsg = "Rferal Does Not exists";
          return res.redirect("/signup");
        }
        console.log("from referal");
        let amountToAdd = 500;
        newHistoryEntry = {
          amount: 500,
          status: "CREDIT",
          referal: data.name,
        };
        const result = await walletDB.findOneAndUpdate(
          { user: new ObjectId(refExistingOrNot._id) }, // find the document by user ID
          {
            $inc: { balance: amountToAdd },
            $push: { history: newHistoryEntry },
          }, // increment the balance and push to history
          {
            returnDocument: "after", // return the updated document
            upsert: true, // create a new document if it doesn't exist
          }
        );
        referalBOL = true;
      }
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

      const referal = Math.floor(1000 + Math.random() * 9000);

      const added = new userDB({
        //adding new user into the DB
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.number,
        otp: otp,
        referal: referal,
      });
      console.log(added);
      if (!added) {
        //checking if is is added
        return res.redirect("/signup");
      }

      await added.save(); //saving
      route = "otp";
      req.session.otp = false;
      req.session.otpName = data.email;
      res.redirect("/otp");

      if (referalBOL) {
        let amountToAdd = 500;
        newHistoryEntry = {
          amount: 500,
          status: "CREDIT",
          referal: refExistingOrNot.name,
        };
        await walletDB.findOneAndUpdate(
          { user: new ObjectId(added._id) }, // find the document by user ID
          {
            $inc: { balance: amountToAdd },
            $push: { history: newHistoryEntry },
          }, // increment the balance and push to history
          {
            returnDocument: "after", // return the updated document
            upsert: true, // create a new document if it doesn't exist
          }
        );
      }
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
  const data = await userDB.findOne({ email: email }).lean();
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
  if (req.session.user) {
    res.redirect("/");
  } else {
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
      } else {
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

const resendOtp = async (req, res) => {
  const generateOTP = () => {
    // generating a 6 digit otp number
    return Math.floor(1000 + Math.random() * 900000); // Generate a 6-digit OTP
  };
  let otp = generateOTP();
  console.log(otp);
  const name = req.session.otpName;
  console.log(name);
  await userDB.updateOne({ email: name }, { otp: otp });
  res.redirect("/otp");
};

// ++++++++++++++++++++++++++++++++++++++++++++++++    SHOP   ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

const shop = async (req, res) => {
  try {
    let data; 
    const limit = 6;

    const ifSorted = req.query.sortedValue
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    let sort = req.body.option ?? "";

    if(!sort && ifSorted){
      sort = ifSorted
    }

    const filter = req.body.selectOption ?? "";
  
    let sortObj = {};
    sortObj.product_price = parseInt(sort);

    if (sort && filter) {
   
        data = await productDB.paginate({ product_category: filter , blocked: false }, { offset: skip, limit: limit ,sort: sortObj  })

    } else if (sort) {
    
       data = await productDB.paginate({ blocked: false }, { offset: skip, limit, sort: sortObj });

    } else if (filter) {

        data = await productDB.paginate({ product_category: filter , blocked: false }, { offset: skip, limit: limit })

    } else {
  
      const options = { page, limit, sort: { 'createdAt': 1 } };
  
        data = await productDB.paginate({}, { offset: skip, limit: limit })
      } 

    const cartData = await cartDb.find({ blocked: false }); //it is categoey DB
    // res.render("user/shop.ejs", { data, cartData, page, maxPage, filter });
    res.render("user/shop.ejs", { data:data.docs , cartData, totalPages :data.totalPages , currentPage:data.page ,filter,limit ,sortVal : sort});

  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).send("fetch error:check once more");
  }
};

const  getProducts = async(req,res)=>{
  const products = await productDB.find()
  res.json({products})
}

// ++++++++++++++++++++++++++++++++++++++++++++++++   CONTACT   ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

const contact = (req, res) => {
  res.render("user/contact.ejs");
};

// ++++++++++++++++++++++++++++++++++++++++++++++++   PRODUCT   ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

const product = async (req, res) => {
  try {
    if (req.session.size) {
      let message;
      message = "PLEASE ENTER SIZE";
      req.session.size = false;
      const userId = req.params.userId;
      const user = await productDB.findById(userId);
      res.render("user/product.ejs", { user, message });
    } else {
      const userId = req.params.userId;
      const user = await productDB.findById(userId);
      res.render("user/product.ejs", { user, message: "" });
    }
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).send("fetch error:check once more");
  }
};

const user = async (req, res) => {
  try {
    const addressID = req.query.id;
    const userId = req.session.user._id;
    req.session.address = true;
    const orderDetails = await orderDB.find({ user: userId });
    const userDetails = await userDB.findById(userId); // used to find address from the user DB
    const addressId = userDetails.addressId;
    let addressDetails = await addressDb.findById(addressId);
    addressDetails = addressDetails ?? "";
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

const editUser = async (req, res) => {
  try {
    const userId = req.session.user._id;
    let img;
    if (req.file === undefined) {
      //if the image does not added
      img = "";
    } else {
      //image added
      img = req.file.filename;
    }
    const data = await userDB.findById(userId);
    const a = await userDB.findByIdAndUpdate(
      userId,
      {
        name: req.body.name,
        phone: req.body.phone,
        gender: req.body.gender,
        user_img_url: img == "" ? data.user_img_url : img,
      },
      { new: true }
    );
    res.redirect("/user");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const changePassword = (req, res) => {
  try {
    if (req.session.invalid) {
      req.session.invalid = false;
      res.render("user/changePassword", { message: req.session.errMsg });
    } else {
      res.render("user/changePassword", { message: "" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const changePasswordPost = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const data = await userDB.findById(userId);
    const isPasswordMatch = await bcrypt.compare(
      req.body.currentPassword,
      data.password
    );

    if (isPasswordMatch) {
      const saltRound = 10; //bcrypting the code for securety
      const hashpassword = await bcrypt.hash(req.body.newPassword, saltRound);
      await userDB.findByIdAndUpdate(userId, {
        password: hashpassword,
      });
      res.redirect("/user");
    } else {
      req.session.invalid = true;
      req.session.errMsg = " Password is incorect";
      res.redirect("/changePassword");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

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
  resendOtp,
  shop,
  contact,
  product,
  user,
  editUser,
  changePassword,
  changePasswordPost,
  getProducts
};
