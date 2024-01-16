const session = require("express-session");
const user = require("../../models/user/usermodel");
const adminDB = require('../../models/admin/adminModel');

// ++++++++++++++++++++++++++++++++++++++++++++++++     USER LOGIN    ++++++++++++++++++++++++++++++++++++++++++++++++++

const login =  (req, res) => {
  if(req,session.invalid){
    let errorMsg = req.session.errMsg
    res.render("admin/login",{message: errorMsg}); 
  }else{
    console.log("hai");
    req,session.invalid  = false
    
    res.render("admin/login",{message: ''});  
  }
} 

const postLogin = async (req, res) => {
  try {
    const adminData = await adminDB.findOne()
    console.log(adminData);
    const { email, password } = req.body;
    const em = "admin@gmail.com";
    const ps = "123";
    if (email != adminData.name) {
      req.session.errMsg = 'WRONG NAME'
      req,session.invalid  = true
      res.redirect("/admin/")
    } else if (password != adminData.password) {
      req,session.invalid  = true
      req.session.errMsg = 'WRONG PASSWORD'
      res.redirect("/admin/")
    } else {
      req.session.adminData = adminData.name ;
      res.redirect("/admin/user");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const logout = (req,res)=>{
  req.session.adminData = null;
  req.session.destroy((err) => { 
    if (err) {
      console.error("Error destroying session:", err);
      res.status(500).send("Error destroying session");
    } else {
      res.redirect("/admin/");
    } 
  });
}

// ++++++++++++++++++++++++++++++++++++++++++++++++USER MANAGEMENT++++++++++++++++++++++++++++++++++++++++++++++++++

const userManagement = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;  //pagenation caode
    const limit = 8;
    const startIndex = (page - 1) * limit; 

    const totalProducts = await user.countDocuments();

    const maxPage = Math.ceil(totalProducts / limit);
    if (page > maxPage) {
      return res.redirect(`/product?page=${maxPage}`);  //checkig the page size
    }

    const searchQuery = req.query.search || ""; // Get the search query from the URL or set it to an empty string if not provided
    // Use a regular expression to perform a case-insensitive search
    const data = await user.find({
      name: { $regex: searchQuery, $options: "i" },
    }).limit(limit)  //limit
    .skip(startIndex)  
    .exec();//fetching data form DB which are only blocked === false
    // cosole.log(searchQuery);
    res.render("admin/user.ejs", { data, searchQuery, page , maxPage, }); //updating searching then displaying user from DB
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const userUnblock = async (req, res) => {
  try {
    const userId = req.params.userId; //URL params
    let { blocked } = req.body;
    blocked = JSON.parse(blocked); //converting the data
    await user.updateOne({ _id: userId }, { blocked: !blocked }); //updating the data
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false }); //if there is any error its sent by fetch
  }
};

module.exports = {
  login,
  postLogin,
  logout,
  userManagement,
  userUnblock,
};
