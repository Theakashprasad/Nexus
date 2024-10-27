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
const walletController = require("../controllers/user/walletController");
const wishlistController = require("../controllers/user/wishlistController");
const { get } = require("mongoose");
 

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
router.get('/resendOtp',usercontroller.resendOtp)

//LOGIN
router.get("/login", usercontroller.login);
router.post("/login", usercontroller.userLogin);

//LOGOUT
router.get("/logout", usercontroller.logout);


//SHOP
router.all("/shop",blockingmiddleware, usercontroller.shop);   
router.get('/get-product-datas',usercontroller.getProducts)

//CONTACT
router.get('/contact',usercontroller.contact)

//PRODUCT
router.get("/product/:userId",blockingmiddleware, usercontroller.product);

//CART
router.get("/cart",sessionMiddleware,cartController.cart);
router.post("/cartPost",sessionMiddleware,cartController.cartPost);
router.post("/updateCart",sessionMiddleware,cartController.updateCart);            
router.post("/removeCart",sessionMiddleware,cartController.removeCart); 

//CHECKOUT
router.get("/checkout",sessionMiddleware,checkoutController.checkout);
router.post("/checkoutPost",sessionMiddleware,checkoutController.checkoutPost)
router.get("/checkoutComplete",sessionMiddleware,checkoutController.checkoutComplete);
router.post("/razorpay",sessionMiddleware,checkoutController.razorpayPost)
router.post("/confirmation",sessionMiddleware,checkoutController.confirmation)
router.put("/coupon",sessionMiddleware,checkoutController.coupon) 
router.get("/checkoutFalure",sessionMiddleware,checkoutController.checkoutFalure);
router.post('/checkoutAddress',sessionMiddleware,checkoutController.checkoutAddress) 

//ADDRESS
router.get("/address",sessionMiddleware,addressController.address);
router.post("/addressPost",sessionMiddleware,addressController.addressPost);
// router.get("/addAddress",sessionMiddleware,addressController.addAddress);
// router.get("/editAddresses",sessionMiddleware,addressController.editAddresses);
router.post("/editAddress/:productId",sessionMiddleware,addressController.editAddress);
router.get("/removeAddress/:addressId",sessionMiddleware,addressController.removeAddress);

//ORDER
router.get("/orderMain",sessionMiddleware,orderController.orderMain);
router.get("/order/:ordId",sessionMiddleware,orderController.order);
router.post("/orderPost",sessionMiddleware,orderController.orderPost);
router.post("/orderCancel",sessionMiddleware,orderController.orderCancel);
router.get("/invoice/:id",sessionMiddleware,orderController.invoice);

//USER PROFILE
router.get("/user",sessionMiddleware,usercontroller.user);
router.post("/editUser",mullter.upload.single("image"),usercontroller.editUser);
router.get("/changePassword",usercontroller.changePassword)
router.post("/changePasswordPost",usercontroller.changePasswordPost)

//FORGRTPASSWORD
router.get("/forgetPassword",forgetController.forgetPassword)
router.post("/forgetPasswordPost",forgetController.forgetPasswordPost)
router.get("/forgetCheck",forgetController.forgetCheck) 
router.post("/forgetCheckPost",forgetController.forgetCheckPost)

//WALLET
router.get('/wallet',sessionMiddleware,walletController.wallet)
router.post('/walletReturn',sessionMiddleware,walletController.walletReturn);
router.post('/walletOrder',sessionMiddleware,walletController.walletOrder);

//WISHLIST
router.get("/wishlist",sessionMiddleware,wishlistController.wishlist);
router.post("/wishlistPost",sessionMiddleware,wishlistController.wishlistPost)
router.get('/wishlistRemove/:proId',sessionMiddleware,wishlistController.wishlistRemove)
router.post('/addToCart',sessionMiddleware,wishlistController.addToCart)


module.exports = router;
