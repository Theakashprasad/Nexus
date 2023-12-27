const catagoryDB = require("../../models/admin/catagoryModel");
const productDB = require("../../models/admin/productModel");

//render product page
const product = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 4;
    const startIndex = (page - 1) * limit;

    const totalProducts = await productDB.countDocuments();

    const maxPage = Math.ceil(totalProducts / limit);
    if (page > maxPage) {
      return res.redirect(`/product?page=${maxPage}`);
    }

    const data = await productDB.find() .limit(limit)
    .skip(startIndex)
    .exec();//fetching data form DB which are only blocked === false
    res.render("admin/product", { data,  page,maxPage, });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

//render add product page
const addProduct = async (req, res) => {
  try {
    const displayCategory = await catagoryDB.find();
    res.render("admin/addProduct", { displayCategory });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const addProductPost = async (req, res) => {
  try {
    const imagePaths = req.files.map((file) => {
      return file.path.substring(6);
    });
    const { productName, description, category, price, quantity1,quantity2,quantity3,quantity4, brand } =
      req.body;
    const data = new productDB({ 
      product_name: productName,
      product_description: description,
      product_category: category,
      product_price: price,
      size: [quantity1,quantity2,quantity3,quantity4],
      product_brand: brand,
      product_img_url: imagePaths,
    });
    await data.save();
    res.redirect("/admin/product");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const editProduct = async (req, res) => {
  try {
    const userId = req.params.userId;
    const displayCategory = await catagoryDB.find();
    const user = await productDB.findById(userId);
    res.render("admin/editProduct", { displayCategory, user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const editProductPost = async (req, res) => {
  try {
    const userId = req.params.userId;
    const data = await productDB.findById(userId);
    let image;
    if (req.file === undefined) {
      //if the image does not added
      image = "";
    } else {
      //image added
      image = req.file.path.substring(6);
    }
    // console.log(image);
    const { productName, description, category, price,quantity1,quantity2,quantity3,quantity4, brand } =
      req.body;
    const user = await productDB.findByIdAndUpdate(
      userId,
      {
        product_name: productName == "" ? data.product_name : productName,
        product_description:
          description == "" ? data.product_description : description,
        product_category: category == "" ? data.product_category : category,
        product_price: price == "" ? data.product_price : price,
        size : [quantity1==''?  data.size[0] : quantity1 , quantity2==''?  data.size[1] : quantity2 , quantity3==''?  data.size[2] : quantity3 , quantity4==''?  data.size[3] : quantity4 ],
        product_brand: brand == "" ? data.product_brand : brand,
        product_img_url: image == "" ? data.product_img_url : image,
      },
      { new: true }
    );
    res.redirect("/admin/product");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const deleteProduct = async (req, res) => {
  try {
    const userId = req.params.userId;
    let { blocked } = req.body;
    blocked = JSON.parse(blocked);
    console.log(blocked);
    const deletete = await productDB.updateOne(
      { _id: userId },
      { blocked: !blocked }
    ); //updates blocked false to true
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
module.exports = {
  product,
  addProduct,
  addProductPost,
  editProduct,
  deleteProduct,
  editProductPost,
};
