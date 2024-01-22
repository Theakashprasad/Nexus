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
    const data = await orderCollection.find()
    // console.log(data);
    await monthlyOrders();
    await yearlyOrders();
    // return res.render('Admin/Dashboard', { admin, dailyOrdersData: dailyData, data,page:1, monthlyData, errmsg: "please login" });
  
    res.render("admin/adminDashboard.ejs",{ admin, dailyOrdersData: dailyData, data,page:1, monthlyData, errmsg: "please login" }); //pasing data
}

module.exports = {
    dashBoard
}