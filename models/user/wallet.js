const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  balance: {
    type: Number,
    default: 0,
  },
  history: [
    {
      date: {
        type: Date,
        default: Date.now,
      },
      amount: {
        type: Number,
      },
      status: {
        type: String, // 'credit' or 'debit'
      },
      orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
      },
      referal :{
        type:String
      }
    },
  ],
 
});

module.exports = mongoose.model('wallet', walletSchema);