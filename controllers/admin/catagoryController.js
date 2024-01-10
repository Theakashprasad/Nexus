const catagoryDB = require("../../models/admin/catagoryModel");
const { ObjectId } = require("mongodb");
const fs = require("fs");
const path = require("path");

// ++++++++++++++++++++++++++++++++++++++++++++++++CATAGOTY MANAGEMENT++++++++++++++++++++++++++++++++++++++++++++++++++

//display catagory
const catagory = async (req, res) => {
  try {
    const data = await catagoryDB.find(); //fetching data form DB which are only blocked === false
    res.render("admin/catagory", { data }); //pasing data
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const addcatagory = (req, res) => {
  res.render("admin/addcatagory"); //rendering addcatagory page
};

const createCatagory = async (req, res) => {
  try {
    const imagePaths = req.file ? req.file.path.substring(6) : null; //removing public/from adderees
    const { categoryName, categoryDescription, categoryPublishDate } = req.body; //destruchering
    const check = await catagoryDB.findOne({ product_category: categoryName });
    //cheking if the data is added before
    if (check) {
      res.send("iteam exits"); //passed through the session
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
    const userId = req.params.userId;   // get the id of the user
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
    console.log(blocked);
    const deletete = await catagoryDB.updateOne(
      { _id: userId },
      { blocked: !blocked }
    ); //updates blocked false to true


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
