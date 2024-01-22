const walletDB = require("../../models/user/wallet");
const userDB = require("../../models/user/usermodel");
const orderDB = require("../../models/user/orderModel");
const productDB = require("../../models/admin/productModel.js");
const cartDB = require("../../models/user/cartModel");
const addressDb = require("../../models/user/addressModel");
const wallet = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; //pagenation caode
    const limit = 4;
    const startIndex = (page - 1) * limit;

    const totalProducts = 7;

    const maxPage = Math.ceil(totalProducts / limit);
    if (page > maxPage) {
      return res.redirect(`/product?page=${maxPage}`); //checkig the page size
    }

    const userId = req.session.user._id;
    const a = await walletDB
      .findOne({ user: userId })
      .limit(limit) //limit
      .skip(startIndex)
      .exec(); //fetching data form DB
    const walletData = a ?? "";
    let orderData = await orderDB.find();
    orderData = orderData;

    // console.log(walletData);
    res.render("user/wallet.ejs", { walletData, page, maxPage, orderData });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
const walletReturn = async (req, res) => {
  try {
    const amount = req.body.amount.slice(1); //amout removing the 1st elemt 7364736$  ,  '$
    const proId = req.body.proId; //product id
    const ordId = req.body.ordId;
    const userId = req.session.user._id; //id of thd user
    const walletData = await walletDB.findOne({ user: userId });
    let balance = 0;

    if (walletData) {
      console.log("hai");
      balance = Number(walletData.balance) + Number(amount); //adding existing amount and the new amount
      const newHistoryEntry = {
        amount: amount,
        status: "CREDIT",
        orderId: ordId,
      };
      const updateQuery = {
        $set: { balance: balance },
        $push: { history: newHistoryEntry },
      };
      const result = await walletDB.updateOne({ user: userId }, updateQuery); //upadteing it in here
    } else {
      balance = amount;
      console.log(userId);
      const wallet = new walletDB({
        //wallet data
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
    const ordData = await orderDB.findByIdAndUpdate(ordId, {
      //updateing the order data
      Status: "RETURN",
    });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const walletOrder = async (req, res) => {
  try {
    const userId = req.session.user._id; //user ID through session
    const ordId = req.body.ordId; //id through body
    console.log(ordId);
    const copId = req.body.copId; //copon id
    const walletData = await walletDB.findOne({ user: userId }); //data frome the wallet
    const a = await cartDB.findOne({ user: userId }); //cart data
    cartData = a ?? "";
    const addressId = await userDB.findById(userId);
    const addresData = await addressDb.findById(addressId.addressId);
    const price = req.body.subtotalAttributeValue;
    if (walletData.balance > price) {
      const orderCreate = new orderDB({
        //saving the data to orderdb
        user: userId,
        products: cartData.products,
        totalAmount: price,
        discount: copId,
        shippingAddress: {
          full_name: addresData.full_name,
          address: addresData.address,
          city: addresData.city,
          state: addresData.state,
          zipcode: addresData.zipcode,
          country: addresData.country,
          phone: addresData.phone,
        },
        paymentMethod: "WALLET",
      });
      await orderCreate.save();
      let orderIdToWalet = orderCreate._id.valueOf(); // or objectId.str

      balance = Number(walletData.balance) - Number(price);
      const newHistoryEntry = {
        amount: price,
        status: "DEBIT",
        orderId: orderIdToWalet,
      };
      const updateQuery = {
        $set: { balance: balance },
        $push: { history: newHistoryEntry },
      };
      const result = await walletDB.updateOne({ user: userId }, updateQuery);

      const products = await productDB.find();
      orderCreate.products.forEach((pro, i) => {
        let product = products.find((item) => item._id.equals(pro.product));
        const a = product.size;
        const b = pro.size;
        let c = [];
        for (let i = 0; i < a.length; i++) {
          c.push(a[i] - b[i]);
        }
        // console.log(c);
        product.size = c;
        product.save();
      });
      await cartDB.findByIdAndDelete(ordId);
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  wallet,
  walletReturn,
  walletOrder,
};
