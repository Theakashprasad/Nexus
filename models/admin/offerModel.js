const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  offerName: {
    type: String,
  },
  offerType: {
    type: String,
    enum: ['product', 'category'],
  },
  offerTypeName: {
    type: String,
  },
  offerValue: {
      type:Number,
      min:0,
      default:0
  },
  validFrom: { 
    type: Date,
    default: Date.now(),
  },
  validTo: {
    type: Date,
    default: Date.now(),
  },
  block :{
    type : Boolean,
    default : false
  }
});

 offer = mongoose.model('Offer', offerSchema);
module.exports = offer;

