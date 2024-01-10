const walletDB = require('../../models/user/wallet');
const userDB = require('../../models/user/usermodel');
const orderDB = require('../../models/user/orderModel')

const wallet = async (req,res)=>{
  try {
    
  const userId = req.session.user._id
  const a = await walletDB.findOne({user:userId})
  const walletData = a ??''
  // console.log(walletData);
   res.render("user/wallet.ejs",{walletData})
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }

}
const walletReturn = async(req,res)=>{
  try {
    
   const amount = req.body.amount.slice(1);
   const proId = req.body.proId
   const ordId = req.body.ordId
   const userId = req.session.user._id
   const walletData = await walletDB.findOne({user:userId})
   let balance =0

   if(walletData){
      console.log("hai");
      balance = Number(walletData.balance) + Number(amount)
      const newHistoryEntry = {
         amount: amount, 
         status: 'CREDIT',
         orderId: ordId,
       };
       const updateQuery = {
         $set: { balance:  balance},
         $push: { history: newHistoryEntry }
       };

       const result = await walletDB.updateOne({ user: userId }, updateQuery);


   }else{
      balance = amount
   console.log(userId);
    const wallet = new walletDB({
    user: userId,
    balance: balance,
    history: [
      {
        amount: amount,
        status: "CREDIT" ,
        orderId: ordId,
      },
    ],
  })
 await wallet.save()
}
   const ordData = await orderDB.findByIdAndUpdate(ordId,{
      Status:'RETURN'
    });
    res.json({ success: true }); 
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }

}

   module.exports = {
    wallet,
    walletReturn
}