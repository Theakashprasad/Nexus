
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
        type : Number,
        default : 0 
    },
    shippingAddress: {
        full_name: String,
        address:String,
        city: String,
        state: String,
        zipcode: String,
        country: String,
        phone: Number
    },
    paymentMethod: {
        type: String,
        required: true
    },
},  {timestamps:true}
)

module.exports = mongoose.model('Order', orderSchema);

