const cartDB = require("../../models/user/cartModel");
const productDB = require("../../models/admin/productModel");
const { ObjectId } = require("mongodb");
const { product } = require("./usercontroller");
const { populate } = require("../../models/user/usermodel");

const cart = async (req, res) => {
  try {
    const userId = new ObjectId(req.session.user._id); //make the session user id to obj id
    const a = await cartDB.aggregate([
      //useing aggregate to lookup add data to the cart
      {
        $match: { user: userId },
      },
      {
        $unwind: "$products",
      },
      {
        $lookup: {
          from: "products",
          localField: "products.product",
          foreignField: "_id",
          as: "cartProduct",
        },
      },
    ]);
    checkUser = a ?? ""; //nullscoilsing

    // console.log(JSON.stringify(checkUser[0].cartProduct,null,2));
    const productdetails = await productDB.find(); //product DB data
    let stock = false;
    checkUser.forEach((prod) => {
      //for the stock
      prod.products.size.forEach((val, idx) => {
        if (val !== 0) {
          if (prod.cartProduct[0].size[idx] == 0) {
            stock = true;
          }
        }
      });
    });
    // console.log(stock);
    res.render("user/cart.ejs", { checkUser, productdetails, stock }); //rendering the cart
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const cartPost = async (req, res) => {
  try {
    const productId = req.body.productId; //id of the pro
    const selectedSize = req.body.selectedSize; //size (6,7,8,9)
    const productPrice = req.body.productPrice; //pro price
    const userId = req.session.user._id; //user ID
    const checkUser = await cartDB.findOne({ user: userId }); //data of the cart by user id
    const productdetails = await productDB.find();
    let productDetails;
    let produtIndex;
    if (selectedSize) {
      if (checkUser) {
        //checks if the data is in the cart or not
        let cartSize;
        cartSize = checkUser.products.filter((value) => {
          return productId == value.product;
        });
        if (cartSize.length == 0) {
          //checks if the data is in the pro or not
          let arr = [0, 0, 0, 0];
          arr[selectedSize] = 1;
          checkUser.products.push({
            //use push to push data to array
            product: productId,
            size: arr,
            price: productPrice,
          });
          checkUser.save();
        } else {
          cartSize[0].product = productId;
          cartSize[0].size[selectedSize] += 1;

          checkUser.save();
        }
      } else {
        const newUser = new cartDB({
          //else to add a new cart data
          user: userId,
          products: [
            {
              product: productId,
              price: productPrice,
            },
          ],
        });
        newUser.products[0].size[selectedSize] = 1;
        await newUser.save();
      }
    } else {
      req.session.size = true;
      res.json({ succes: true });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const updateCart = async (req, res) => {
  //updateing the cart
  try {
    const userId = req.session.user._id; //use id
    const productId = req.body.productId; //pro id
    const qnt = req.body.qnt; //qnt of the pro
    const sizeInx = req.body.sizeInx; //index of the product
    const productQnt = await productDB.findById(productId); //data from the productDB
    const productSizeQnt = productQnt.size[sizeInx]; //use Index
    const userData = await cartDB.findOne({ user: userId }); //csrt DATA
    const a = userData.products.filter((value) => {
      return value.product == productId;
    });
    let cartSizeQnt = a[0].size[sizeInx];

    if (productSizeQnt <= cartSizeQnt) {
      //STOCK
      // console.log(`a[0].size[sizeInx] = productQnt.product_qty;`)
      // console.log(`a[0].size[${sizeInx}] = ${productQnt.product_qty}`)
      a[0].size[sizeInx] = productQnt.product_qty;
      await userData.save();
      res.json({ stock: true });
    } else {
      console.log("hai");
      a[0].size[sizeInx] = qnt;
      await userData.save();
      res.json({ stock: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const removeCart = async (req, res) => {
  try {
    const userId = req.session.user._id; //remmoving
    const proId = req.body.reoveId; //id of pro
    const sizeIdx = req.body.size; //index

    await cartDB.findOneAndUpdate(
      { user: userId, "products.product": proId },
      { $set: { [`products.$.size.${sizeIdx}`]: 0 } },
      { new: true }
    );

    res.json({ sucess: true });
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
