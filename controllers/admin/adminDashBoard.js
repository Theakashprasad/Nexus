const orderCollection = require('../../models/user/orderModel');

const dashBoard = async (req, res) => {
    // DashboardGet---------------------------------------------------------------------------------
    const admin = true;
    let dailyData;
    let monthlyData;
    // Aggregate monthly orders
    const monthlyOrders = async () => {      //4 the monthly orders
      try {
        const monthlyresult = await orderCollection.aggregate([  //use aggregate
          {
            $group: {
              _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
              totalOrders: { $sum: 1 },
            },
          },
          {
            $sort: { "_id.year": 1, "_id.month": 1 },   //sorting to 
          },
          {
            $project: {
              _id: 1,
              totalOrders: 1,
            },
          },
        ]);
  
        let data = Array.from({ length: 12 }, (_, i) => ({
          _id: { month: i + 1 },
          totalOrders: 0,
        }));
  
        let k = 0;
        dailyData = data.map((ele, i) => {
          if (monthlyresult[k]?._id.month === i + 1) {
            return monthlyresult[k++].totalOrders;
          } else {
            return 0;
          }
        });
      } catch (error) {
        console.error("Error aggregating daily orders:", error);
      }
    };
  
    // Aggregate yearly orders
    const yearlyOrders = async () => {
      try {
        const yearlyresult = await orderCollection.aggregate([
          {
            $group: {
              _id: { year: { $year: "$createdAt" } },
              totalOrders: { $sum: 1 },
            },
          },
          {
            $sort: { "_id.year": 1 },
          },
        ]);
        monthlyData = yearlyresult.map((ele) => ele.totalOrders);
      } catch (error) {
        console.error("Error aggregating yearly orders:", error);
      }
    };
    let monthlyresultCategory
    let montlyData=[]
    const monthlyOrdersCategory = async () => {      //4 the monthly orders
      try {
         monthlyresultCategory = await orderCollection.aggregate([  //use aggregate
        {$unwind:'$products'}, 
        {$lookup:{
          from:'products',
          foreignField:'_id',
          localField:'products.product',
          as:'productDetails'
        }} ,{$unwind:'$productDetails'},

        {
            $group: {
              _id:{ month: { $month: "$createdAt" }, year: { $year: "$createdAt" },category:'$productDetails.product_category'} ,
              totalOrders: { $sum: 1 },
            },
          },
          {
            $sort: { "_id.year": 1, "_id.month": 1 },   //sorting to 
          },
          {
            $project: {
              _id: 1,
              totalOrders: 1,
            },
          },
        ]);
        let data1=monthlyresultCategory.map((ele)=>ele._id.category)
        montlyData.push(data1)
        let data2=monthlyresultCategory.map((ele)=>ele.totalOrders)
        montlyData.push(data2)
       
      } catch (error) {
        console.error("Error aggregating daily orders:", error);
      }
    };



    let  yearlyresultCategory
    let yerlyData=[]
     const yearlyOrdersCategory = async () => {      //4 the monthly orders
      try {
        yearlyresultCategory = await orderCollection.aggregate([  //use aggregate
        {$unwind:'$products'}, 
        {$lookup:{
          from:'products',
          foreignField:'_id',
          localField:'products.product',
          as:'productDetails'
        }} ,{$unwind:'$productDetails'},

        {
            $group: {
              _id:{year: { $year: "$createdAt" },category:'$productDetails.product_category'} ,
              totalOrders: { $sum: 1 },
            },
          },
          {
            $sort: { "_id.year": 1, "_id.month": 1 },   //sorting to 
          },
          {
            $project: {
              _id: 1,
              totalOrders: 1,
            },
          },
        ]);
        console.log(yearlyresultCategory);
        let data1=yearlyresultCategory.map((ele)=>ele._id.category)
        let data2=yearlyresultCategory.map((ele)=>ele.totalOrders)
        yerlyData.push(data1)
        yerlyData.push(data2)
      } catch (error) {
        console.error("Error aggregating daily orders:", error);
      }
    };
    const data = await orderCollection.find()
    await monthlyOrders()
    await yearlyOrders()
    await monthlyOrdersCategory()
    await yearlyOrdersCategory()
    console.log(montlyData);
    console.log(yerlyData);
    // return res.render('Admin/Dashboard', { admin, dailyOrdersData: dailyData, data,page:1, monthlyData, errmsg: "please login" });
  
    res.render("admin/adminDashboard.ejs",{  dailyOrdersData: dailyData, yerlyData,montlyData,data,page:1, monthlyData, errmsg: "please login" }); //pasing data
}

module.exports = {
    dashBoard
}