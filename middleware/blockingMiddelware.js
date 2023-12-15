const userDB = require("../models/user/usermodel");
const blockingmiddleware = async (req, res, next) => {
  const user = req.session.user;

  if(req.session.user){
    const id = user._id
const data = await userDB.findById(id)
if(data.blocked){
  req.session.destroy() ; 
  res.redirect("/login"); 
}else{
  next();
}
} 
else {
    next()
  }

// if(user.blocked){
//   res.send("block")
// }  else{
//   next
// }
};


module.exports = blockingmiddleware;
