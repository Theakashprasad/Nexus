
const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    products: [{    
        product: {
            type: Schema.Types.ObjectId,
            ref: 'product', 
            required: true
        },
        price:{
            type:Number
        },
        size: { 
            type: [Number],
            default: [0, 0, 0, 0],
          },
    }],
    Status:{
        type: String,
        default: 'PENDING',
    },
    totalAmount: {
        type: Number,
        required: true
    },
    discount:{
        type: Schema.Types.ObjectId,
        ref: 'coupon',
    },
    shippingAddress: {
        type: Schema.Types.ObjectId,
        ref: 'address',
        required: true
    },
    paymentMethod: {
        type: String,
        required: true
    },
    orderDate: {
        type: Date,
        default: Date.now()
    },
});

module.exports = mongoose.model('Order', orderSchema);

