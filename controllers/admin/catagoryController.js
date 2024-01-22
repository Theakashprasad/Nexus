const catagoryDB = require("../../models/admin/catagoryModel");
const { ObjectId } = require("mongodb");
const fs = require("fs");
const path = require("path");
const productDB = require("../../models/admin/productModel");

// ++++++++++++++++++++++++++++++++++++++++++++++++CATAGOTY MANAGEMENT++++++++++++++++++++++++++++++++++++++++++++++++++

//display catagory
const catagory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; //pagenation code
    const limit = 3;
    const startIndex = (page - 1) * limit;
    const totalProducts = await catagoryDB.countDocuments();
    const maxPage = Math.ceil(totalProducts / limit);
    if (page > maxPage) {
      return res.redirect(`/product?page=${maxPage}`); //checking if the page is gte
    }
    const data = await catagoryDB
      .find()
      .limit(limit) //limiting the data
      .skip(startIndex)
      .exec(); //fetching data form DB which are only blocked === false

    res.render("admin/catagory", { data, page, maxPage }); //pasing data
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const addcatagory = (req, res) => {
  if(req.session.invalid){
    const message = 'Iteam already exist'
    res.render("admin/addcatagory",{message:message}); 
  }else{
    req.session.invalid = false
    res.render("admin/addcatagory",{message:''}); //rendering addcatagory page
  }
};

const createCatagory = async (req, res) => {
  try {
    const imagePaths = req.file ? req.file.path.substring(6) : null; //removing public/from adderees
    const { categoryName, categoryDescription, categoryPublishDate } = req.body; //destruchering
    const check = await catagoryDB.findOne({ product_category: categoryName });
    //cheking if the data is added before
    if (check) {
      req.session.invalid = true
      res.redirect("/admin/addcatagory");
      //passed through the session
    } else {
      const newCatagory = new catagoryDB({
        //creating new data
        product_category: categoryName,
        category_description: categoryDescription,
        category_publishDate: categoryPublishDate,
        category_img_url: imagePaths,
      });
      await newCatagory.save(); //saveing data
      res.redirect("/admin/catagory");
    }
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).send("fetch error:check once more");
  }
};

const editcatagory = async (req, res) => {
  try {
    const userId = req.params.userId; // get the id of the user
    const user = await catagoryDB.findById(userId);
    res.render("admin/editcatagory", { user });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).send("fetch error:check once more");
  }
};

const editCatagoryPost = async (req, res) => {
  //edit the catagory
  try {
    const { categoryName, categoryDescription, categoryPublishDate } = req.body;
    const userId = req.params.userId;
    if (req.file === undefined) {
      //if the image does not added
      let image = "";
    } else {
      //image added
      image = req.file.path.substring(6);
    }
    const data = await catagoryDB.findById(userId);

    const user = await catagoryDB.findByIdAndUpdate(
      userId,
      {
        product_category:
          categoryName == "" ? data.product_category : categoryName, //if the data does not have any value then the previous data should store again
        category_description:
          categoryDescription == ""
            ? data.category_description 
            : categoryDescription,
        category_publishDate:
          categoryPublishDate == ""
            ? data.category_publishDate
            : categoryPublishDate,
        category_img_url: image == "" ? data.category_img_url : image,
      },
      { new: true }
    );
    res.redirect("/admin/catagory");
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).send("fetch error:check once more");
  }
};

const deleteCatagory = async (req, res) => {
  try {
    const userId = req.params.userId;
    let { blocked } = req.body;
    blocked = JSON.parse(blocked);
    const productCategoryValue = req.body.productCategoryValue;
    const deletete = await catagoryDB.updateOne(
      { _id: userId },
      { blocked: !blocked }
    ); //updates blocked false to true
    const data = await productDB.updateMany(
      { product_category: productCategoryValue },
      {
        $set: { blocked: !blocked },
      }
    );

    res.json({ success: true });

    // res.redirect("/admin/catagory");
    if (!deletete) {
      return res.send("category not deletd");
    }
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).send("fetch error:check once more");
  }
};

module.exports = {
  addcatagory,
  createCatagory,
  catagory,
  editcatagory,
  editCatagoryPost,
  deleteCatagory,
};
