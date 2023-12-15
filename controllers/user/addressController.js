const addressDB = require("../../models/user/addressModel");

const address = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const addressColection = await addressDB.find({user:userId});
    res.render("user/address.ejs", { addressColection });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).send("fetch error:check once more");
  }
};

const addressPost = async (req, res) => {
  try {
    const addressColection = new addressDB({
      user: req.session.user._id,
      full_name: req.body.full_name,
      address: req.body.address,
      phone: req.body.phone,
      city: req.body.city,
      country: req.body.country,
      state: req.body.state,
      zipcode: req.body.zipcode,
    });
    await addressColection.save();
    if(req.session.address){
      res.redirect("/address");
    }else{
      res.redirect("/checkout");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const removeAddress = async (req, res) => {

  try {
    const addressId = req.params.addressId;
    await addressDB.findByIdAndDelete(addressId);
    if(req.session.address){
      res.redirect("/address");
    }else{
      res.redirect("/checkout");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// const editAddresses = (req,res)=>{
//          res.send("edit")
// }

const editAddress = async (req, res) => {
  try {
    const productId = req.params.productId;
console.log(req.body.address1);
    const editAddressColection = await addressDB.findByIdAndUpdate(
      productId,
      {
        full_name: req.body.full_name1,
        address: req.body.address1,
        phone: req.body.Phone1,
        city: req.body.city1,
        country: req.body.country1,
        state: req.body.state1,
        zipcode: req.body.zipcode1,
      },
      { new: true }
    );
if(req.session.address){
      res.redirect("/address");
    }else{
      res.redirect("/checkout");
    }
    } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// const addAddress = (req,res)=>{
//    res.render("user/addAddress.ejs")
// }

module.exports = {
  address,
  addressPost,
  removeAddress,
  editAddress,
  // addAddress,
  // editAddresses
};
