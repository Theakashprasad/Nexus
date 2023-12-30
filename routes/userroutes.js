const express = require("express");
const router = express.Router();
const sessionMiddleware = require("../middleware/sessionMiddelware");
const blockingmiddleware = require("../middleware/blockingMiddelware");
const mullter = require("../middleware/mullter");
const usercontroller = require("../controllers/user/usercontroller");
const cartController = require("../controllers/user/cartController");
const checkoutController = require("../controllers/user/checkoutController");
const addressController = require("../controllers/user/addressController");
const orderController = require("../controllers/user/orderController");
const forgetController = require("../controllers/user/forgetController");


//FOR CHECKING
router.get("/a", usercontroller.a); //testing any code

//HOME
router.get("/", blockingmiddleware,usercontroller.home);

//SIGN IN
router.get("/signup", usercontroller.signup);
router.post("/usersignup", usercontroller.usersignup);

//OTP
router.get("/otp", usercontroller.otp);
router.post("/userOtp", usercontroller.userOtp);

//LOGIN
router.get("/login", usercontroller.login);
router.post("/login", usercontroller.userLogin);

//LOGOUT
router.get("/logout", usercontroller.logout);

//SHOP
router.all("/shop",blockingmiddleware, usercontroller.shop);   

//PRODUCT
router.get("/product/:userId",blockingmiddleware, usercontroller.product);

//CART
router.get("/cart",sessionMiddleware,cartController.cart);
router.post("/cartPost",sessionMiddleware,cartController.cartPost);
router.post("/updateCart",cartController.updateCart);            
router.post("/removeCart",cartController.removeCart); 


//CHECKOUT
router.get("/checkout",sessionMiddleware,checkoutController.checkout);
router.post("/checkoutPost",checkoutController.checkoutPost)
router.get("/checkoutComplete",sessionMiddleware,checkoutController.checkoutComplete);
router.post("/razorpay",checkoutController.razorpayPost)
router.post("/confirmation",checkoutController.confirmation)


//ADDRESS
router.get("/address",sessionMiddleware,addressController.address);
router.post("/addressPost",addressController.addressPost);
// router.get("/addAddress",sessionMiddleware,addressController.addAddress);
// router.get("/editAddresses",sessionMiddleware,addressController.editAddresses);
router.post("/editAddress/:productId",addressController.editAddress);
router.get("/removeAddress/:addressId",addressController.removeAddress);

//ORDER
router.get("/orderMain",sessionMiddleware,orderController.orderMain);
router.get("/order/:ordId",sessionMiddleware,orderController.order);
router.post("/orderPost",orderController.orderPost);
router.post("/orderCancel",orderController.orderCancel);

//USER PROFILE
router.get("/user",sessionMiddleware,usercontroller.user);
router.post("/editUser",mullter.upload.single("image"),usercontroller.editUser);
router.get("/changePassword",usercontroller.changePassword)
router.post("/changePasswordPost",usercontroller.changePasswordPost)


router.get("/forgetPassword",forgetController.forgetPassword)
router.post("/forgetPasswordPost",forgetController.forgetPasswordPost)
router.get("/forgetCheck",forgetController.forgetCheck)
router.post("/forgetCheckPost",forgetController.forgetCheckPost)


module.exports = router;
