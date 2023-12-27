const express = require("express");
const router = express.Router();

const multer = require("../middleware/mullter"); //multer
const adminSessionMiddleware = require("../middleware/adminSessionMiddelware");
const admincontroller = require("../controllers/admin/admincontroller"); // lofin , user
const catagorycontroller = require("../controllers/admin/catagoryController"); // catagory
const productController = require("../controllers/admin/productController"); //product
const orderController = require("../controllers/admin/orderController");

router.get("/", admincontroller.login);
router.post("/postLogin", admincontroller.postLogin);
router.get("/logout", admincontroller.logout);

// +++++++++++++++++++++++++++++++++++++++++++++++++++         USER               ++++++++++++++++++++++++++++++++++++++++++++++++++

router.get("/user", adminSessionMiddleware, admincontroller.userManagement);
router.put("/userUnblock/:userId", admincontroller.userUnblock);

// +++++++++++++++++++++++++++++++++++++++++++++++++++         CATAGORY               ++++++++++++++++++++++++++++++++++++++++++++++++++

router.get("/catagory", adminSessionMiddleware, catagorycontroller.catagory);
router.get(
  "/addcatagory",
  adminSessionMiddleware,
  catagorycontroller.addcatagory
);
router.post(
  "/createCatagory",
  multer.upload.single("image"),
  catagorycontroller.createCatagory
);
router.get("/editcatagory/:userId", catagorycontroller.editcatagory);
router.post(
  "/editCatagoryPost/:userId",
  multer.upload.single("image"),
  catagorycontroller.editCatagoryPost
);
router.put("/deleteCatagory/:userId", catagorycontroller.deleteCatagory);

// +++++++++++++++++++++++++++++++++++++++++++++++++++         PRODUCT               ++++++++++++++++++++++++++++++++++++++++++++++++++

router.get("/product", adminSessionMiddleware, productController.product);
router.get("/addProduct", adminSessionMiddleware, productController.addProduct);
router.post(
  "/addProductPost",
  multer.upload.array("image", 4),
  productController.addProductPost
);
router.get("/editProduct/:userId", productController.editProduct);
router.post(
  "/editProductPost/:userId",
  multer.upload.array("image", 4),
  productController.editProductPost
);
router.put("/deleteProduct/:userId", productController.deleteProduct);

router.get("/order", adminSessionMiddleware, orderController.order);
router.get("/orderView/:ordId", orderController.orderView);
router.post("/orderPost", orderController.orderPost);

module.exports = router;
