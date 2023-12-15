const cartDB = require("../../models/user/cartModel");
const productDB = require("../../models/admin/productModel");
const { product } = require("./usercontroller");

const cart = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const a = await cartDB.findOne({ user: userId });
    checkUser = a ??''
    console.log(checkUser.length);
    const productdetails = await productDB.find();
    res.render("user/cart.ejs", { checkUser, productdetails });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const cartPost = async (req, res) => {
  try {
    const productId = req.body.productId;
    const userId = req.session.user._id;
    const checkUser = await cartDB.findOne({ user: userId });
    const productdetails = await productDB.find();
    let productDetails;
    let produtIndex;

    if (checkUser) {
      productDetails = checkUser.products;
      produtIndex = productDetails.findIndex((value) => {
        return value.product.equals(productId);
      });

      if (produtIndex != -1) {
        productDetails[produtIndex].quantity += 1;
        checkUser.save();
      } else {
        productDetails.push({
          quantity: 1,
          product: productId,
        });
        checkUser.save();
      }
    } else {
      const newUser = new cartDB({
        user: userId,
        products: [
          {
            quantity: 1,
            product: productId,
          },
        ],
      });
      await newUser.save();
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const updateCart = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const productId = req.body.productId;
    const qnt = req.body.qnt;
    const userData = await cartDB.findOne({ user: userId });
    const a = userData.products.filter((value) => {
      return value.product == productId;
    });
    a[0].quantity = qnt;
    userData.save();
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const removeCart = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const proId = req.params.proId;
    const userData = await cartDB.findOne({ user: userId });
    await cartDB.updateOne(
      { user: userId },
      { $pull: { products: { product: proId } } }
    );
    res.redirect("/cart");
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  cart,
  cartPost,
  updateCart,
  removeCart,
};
