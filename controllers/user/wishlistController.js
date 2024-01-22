const wishlistDB = require("../../models/user/wishlistModel");
const productDB = require("../../models/admin/productModel");
const cartDB = require("../../models/user/cartModel");
const { ObjectId } = require("mongodb");

const wishlist = async (req, res) => {
  try {
    const userId = req.session.user._id; //user ID
    const wishlistData = await wishlistDB.findOne({ user: userId }); //wishlist DATA
    const productData = await productDB.find(); //product DB
    let cart = await cartDB.findOne({ user: userId }); //cartB
    let cartData;
    if (cart) {
      cartData = cart.products;
    }
    res.render("user/wishlist.ejs", { wishlistData, productData, cartData }); //renderin wishlist
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
const wishlistPost = async (req, res) => {
  try {
    if (!req.session.user) {
      //checking session
      res.json({ session: true });
    } else {
      const userId = req.session.user._id;
      const proId = req.body.productId;
      // const wishlistData = await wishlistDB.findOne({ user: userId }, {});
      wishlistData = await wishlistDB.findOne({
        user: userId,
        products: {
          $elemMatch: {
            product: proId,
          },
        },
      });
      if (wishlistData) {
        res.json({ added: false });
      } else {
        res.json({ added: true });

        // const wishlistSave = new wishlistDB({
        //       user: userId,
        //       products: [
        //         {
        //           product: proId,
        //         },
        //       ],
        //     });
        //     wishlistSave.save();

        await wishlistDB.findOneAndUpdate(
          { user: userId },
          { $push: { products: { product: proId } } },
          { upsert: true, new: true }
        );
      }

      // if (wishlistData) {
      //   wishlistData.products.push({
      //     product: proId,
      //   });
      //   wishlistData.save();
      // } else {
      //   const wishlistSave = new wishlistDB({
      //     user: userId,
      //     products: [
      //       {
      //         product: proId,
      //       },
      //     ],
      //   });
      //   wishlistSave.save();
      // }
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const wishlistRemove = async (req, res) => {
  //removeing wishlist product
  try {
    const wishId = req.params.proId; //id of the product
    const userId = req.session.user._id; // id of the user

    await wishlistDB.updateOne(
      //updating the wishlost page
      { user: userId },
      { $pull: { products: { product: wishId } } }
    );

    res.redirect("/wishlist");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const addToCart = async (req, res) => {
  try {
    const proId = req.body.productId; //product ID
    const a = await cartDB.find(); //cart db
    const convertedObjectId = new ObjectId(proId);
    const userId = req.session.user._id;
    const cartData = await cartDB.findOne({ user: userId }); //cart data
    const ifExist = await cartDB.findOne({
      //cart db
      products: { $elemMatch: { product: proId } },
    });

    if (ifExist) {
      //if exist cat db ==> pro
    } else {
      let arr = [0, 0, 0, 0];
      arr[0] = 1;
      cartData.products.push({
        //push data in to a arrray
        product: proId,
        size: arr,
      });
      cartData.save();
    }
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  wishlist,
  wishlistPost,
  wishlistRemove,
  addToCart,
};
