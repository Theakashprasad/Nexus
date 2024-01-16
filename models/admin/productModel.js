const { text } = require("express");
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  product_name: {
    type: String,
  },
  product_description: {
    type: String,
  },  
  product_price: {
    type: Number,
    min: 0,
  },
  product_real_price: {
    type: Number,
    min: 0,
  },
  product_category: {
    type: String,
  },
  product_brand: {
    type: String,
  },
  blocked: {
    type: Boolean,
    default: false,
  },
  size: {
    type: [Number],
    default: [0, 0, 0, 0],
  },
  
  product_img_url: {
    type: [String],
  },
});
productCollection = mongoose.model("product", productSchema);
module.exports = productCollection;
