const orderDB = require("../../models/user/orderModel");
const cartDB = require("../../models/user/cartModel");
const productDB = require("../../models/admin/productModel");
const addressDb = require("../../models/user/addressModel");
const userDB = require("../../models/user/usermodel");
const couponDB = require("../../models/admin/couponModel");
const walletDB = require("../../models/user/wallet");
const { ObjectId } = require("mongodb");

const orderMain = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 7;
  const startIndex = (page - 1) * limit;
  const totalProducts = await orderDB.countDocuments();
  const maxPage = Math.ceil(totalProducts / limit);
  if (page > maxPage) {
    return res.redirect(`/product?page=${maxPage}`);
  }

  try {
    const userId = req.session.user._id;

    const a = await orderDB
      .find({ user: userId })
      .limit(limit)
      .skip(startIndex)
      .exec();
    let orderDetails = a.reverse();
    // console.log(JSON.stringify(orderDetails,null,2));
    const addressData = await addressDb.find();
    const productData = await productDB.find();

    res.render("user/orderMain.ejs", {
      orderDetails,
      addressData,
      productData,
      page,
      maxPage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const order = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const orderId = req.params.ordId;
    const userDetails = await userDB.findById(userId); // used to find address from the user DB
    const addressId = userDetails.addressId;
    let addressDetails = await addressDb.findById(addressId);
    addressDetails = addressDetails ?? "";
    const orderDetails = await orderDB.findById(orderId);
    const productIdData = orderDetails.products;
    const productData = await productDB.find();
    const couponData = await couponDB.findById(orderDetails.discount);
    res.render("user/order.ejs", {
      userDetails,
      addressDetails,
      orderDetails,
      productData,
      productIdData,
      couponData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const orderPost = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const a = await cartDB.findOne({ user: userId });
    cartData = a ?? "";
    const totalAmount = req.body.subtotalAttributeValue;
    const ordId = req.body.ordId;
    const copId = req.body.copId;
    const addressId = await userDB.findById(userId);
    const orderCreate = new orderDB({
      user: userId,
      products: cartData.products,
      totalAmount: totalAmount,
      discount: copId,
      shippingAddress: addressId.addressId,
      paymentMethod: "COD",
    });
    await orderCreate.save();
    const products = await productDB.find();
    orderCreate.products.forEach((pro, i) => {
      let product = products.find((item) => item._id.equals(pro.product));
      const a = product.size;
      const b = pro.size;
      let c = [];
      for (let i = 0; i < a.length; i++) {
        c.push(a[i] - b[i]);
      }
      console.log(c);
      product.size = c;
      product.save();
    });
    await cartDB.findByIdAndDelete(ordId);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const orderCancel = async (req, res) => {
  try {
    const proId = req.body.proId;
    const ordId = req.body.ordId;
    const statusValue = req.body.statusValue;
    const ordData = await orderDB.findById(ordId)
    console.log(ordData.Status);
    // NOT COD
    if (!(ordData.paymentMethod === "COD" && ordData.Status === 'CANCEL')) {

      const amount = req.body.amount.slice(1);
      const proId = req.body.proId;
      const ordId = req.body.ordId;
      const userId = req.session.user._id;
      const walletData = await walletDB.findOne({ user: userId });
      let balance = 0;

      if (walletData) {
        console.log("hai");
        balance = Number(walletData.balance) + Number(amount);
        const newHistoryEntry = {
          amount: amount,
          status: "CREDIT",
          orderId: ordId,
        };
        const updateQuery = {
          $set: { balance: balance },
          $push: { history: newHistoryEntry },
        };

        const result = await walletDB.updateOne({ user: userId }, updateQuery);
      } else {
        balance = amount;
        console.log(userId);
        const wallet = new walletDB({
          user: userId,
          balance: balance,
          history: [
            {
              amount: amount,
              status: "CREDIT",
              orderId: ordId,
            },
          ],
        });
        await wallet.save();
      }
    }
    console.log(statusValue);
    if (statusValue == "RETURN") {
     await orderDB.findByIdAndUpdate(ordId, {
        Status: "RETURN",
      });
    } else {
      console.log('cancel');
      await orderDB.findByIdAndUpdate(ordId, {
        Status: "CANCEL",
      });
    }

    //    COD
 

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  orderMain,
  order,
  orderPost,
  orderCancel,
};
