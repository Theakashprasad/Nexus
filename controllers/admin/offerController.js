const offerDB = require("../../models/admin/offerModel");
const productDB = require("../../models/admin/productModel");
const categoryDB = require("../../models/admin/catagoryModel");

const offer = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; //pagenation caode
    const limit = 4;
    const startIndex = (page - 1) * limit;

    const totalProducts = await offerDB.countDocuments();

    const maxPage = Math.ceil(totalProducts / limit);
    if (page > maxPage) {
      return res.redirect(`/product?page=${maxPage}`); //checkig the page size
    }

    const productData = await productDB.find();
    const categoryData = await categoryDB.find();
    const offerData = await offerDB
      .find({ block: false })
      .limit(limit) //limit
      .skip(startIndex)
      .exec(); //fetching data form DB which are only blocked === false
    res.render("admin/offer", {
      productData,
      categoryData,
      offerData,
      page,
      maxPage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
const offerAdd = async (req, res) => {
  try {
    const categoryData = await categoryDB.find();

    let { couponName, couponValue, category, product, validFrom, validTo } =
      req.body;
    couponValue = Number(couponValue);
    const offerData = new offerDB({
      offerName: couponName,
      offerType: category == "" ? "product" : "category",
      offerTypeName: category == "" ? product : category,
      offerValue: couponValue,
      validFrom: validFrom,
      validTo: validTo,
    });
    offerData.save();

    if (category) {
      const query = { product_category: category };
      const decVal = couponValue / 100;

      // Find documents matching the query and update the product_price to 90% of its original value
      const update = [
        {
          $set: {
            product_price: {
              $trunc: {
                $multiply: [
                  {
                    $max: [
                      0, // Ensures that the result is not negative
                      {
                        $subtract: [
                          "$product_price",
                          { $multiply: ["$product_price", decVal] },
                        ],
                      },
                    ],
                  },
                  1, // To round to the nearest integer
                ],
              },
            },
          },
        },
      ];

      // Your update operation here
      const result = await productDB.updateMany(query, update);
    } else {
      const productData = await productDB.findOne({ product_name: product });

      // const offerPrice = Math.abs( productData.product_real_price * (1 - couponValue / 100) - productData.product_real_price
      // );
      const offerPrice = Math.abs(
        productData.product_real_price / couponValue -
          productData.product_real_price
      );
      const discountPrise = productData.product_price;
      // console.log(discountPrise ,offerPrice); 

      if (discountPrise <= offerPrice) {
        console.log("not update");
      } else {
        productData.product_price = offerPrice;
        productData.save();
      }
    }

    res.redirect("/admin/offer");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const offerDel = async (req, res) => {
  try {
    const offerId = req.body.offerId;
    const offerData = await offerDB.findById(offerId);
    if (offerData.offerType == "category") {
      let proVal = offerData.offerTypeName;

      await productDB.updateMany({ product_category: proVal }, [
        {
          $set: {
            product_price: "$product_real_price", // Update product_price based on product_real_price
          },
        },
      ]);

      offerData.block = true;
      offerData.save();
      res.json({ success: true });
    } else {
      let proVal = offerData.offerTypeName;
      console.log(proVal, "- name of the product");
      await productDB.updateMany({ product_name: proVal }, [
        {
          $set: {
            product_price: "$product_real_price", // Set the product_price field to the value of product_real_price
          },
        },
      ]);
      offerData.block = true;
      offerData.save();

      res.json({ success: true });
    }

    // console.log(offerData);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const offerEdit = async (req, res) => {
  const offerId = req.params.offID;
  const offerData = await offerDB.findById(offerId);
  const productData = await productDB.find();
  const categoryData = await categoryDB.find();

  // console.log(offerId);
  res.render("admin/editoffer", { productData, categoryData, offerData });
};

const offerEditPost = async (req, res) => {
  const offerId = req.params.offID;
  console.log(offerId);
  const { couponName, couponValue, category, product, validFrom, validTo } =
    req.body;
  console.log(couponName, couponValue, category, product, validFrom, validTo);

  const offerData = new offerDB({
    offerName: couponName,
    offerType: category == "" ? "product" : "category",
    offerTypeName: category == "" ? product : category,
    offerValue: couponValue,
    validFrom: validFrom,
    validTo: validTo,
  });
  offerData.save();

  if (category) {
    const query = { product_category: category };
    const decVal = couponValue / 100;

    // Find documents matching the query and update the product_price to 90% of its original value
    const update = [
      {
        $set: {
          product_price: {
            $trunc: {
              $multiply: [
                {
                  $max: [
                    0, // Ensures that the result is not negative
                    {
                      $subtract: [
                        "$product_price",
                        { $multiply: ["$product_price", decVal] },
                      ],
                    },
                  ],
                },
                1, // To round to the nearest integer
              ],
            },
          },
        },
      },
    ];

    // Your update operation here
    const result = await productDB.updateMany(query, update);
  } else {
    const productData = await productDB.findOne({ product_name: product });
    const offerPrice = Math.abs(
      productData.product_real_price * (1 - couponValue / 100) -
        productData.product_real_price
    );
    const discountPrise = productData.product_price;
    // console.log(discountPrise ,offerPrice);

    if (discountPrise <= offerPrice) {
      console.log("not update");
    } else {
      productData.product_price = offerPrice;
      productData.save();
    }
  }

  res.redirect("/admin/offer");
};

module.exports = {
  offer,
  offerAdd,
  offerDel,
  offerEdit,
  offerEditPost,
};
