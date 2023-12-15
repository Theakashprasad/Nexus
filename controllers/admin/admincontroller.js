const session = require("express-session");
const user = require("../../models/user/usermodel");

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
  const { email, password } = req.body;
  const em = "admin@gmail.com";
  const ps = "123";
  if (email != em) {
    req.session.errMsg = 'WRONG NAME'
    req,session.invalid  = true
    res.redirect("/admin/")
  } else if (password != ps) {
    req,session.invalid  = true
    req.session.errMsg = 'WRONG PASSWORD'
    res.redirect("/admin/")
  } else {
    req.session.adminData = em ;
    res.redirect("/admin/user");
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

    const searchQuery = req.query.search || ""; // Get the search query from the URL or set it to an empty string if not provided

    // Use a regular expression to perform a case-insensitive search
    const data = await user.find({
      name: { $regex: searchQuery, $options: "i" },
    });
    // cosole.log(searchQuery);
    res.render("admin/user.ejs", { data, searchQuery }); //updating searching then displaying user from DB
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
