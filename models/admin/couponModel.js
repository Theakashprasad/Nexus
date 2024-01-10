const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
 couponName: {
    type: String,
  },
  couponValue: {
    type: Number,
    min: 0,
    default: 0,
  },
  minimumPurchase: {
    type: Number,
    min: 0,
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true,
  },
  validFrom: {
    type: Date,
    default: Date.now(),
  },
  validTo: {
    type: Date,                                
    default: Date.now(),
  }, 

}, { timestamps: true } );

 couponModel =  mongoose.model('coupon', couponSchema);
module.exports = couponModel; 
