const mongoose = require("mongoose");
const { Schema } = mongoose;

const cartSchema = new mongoose.Schema({
    user: {
        type:Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    products: [{              
        quantity: {
            type: Number,
            required: true
        },
        product: { 
            type: Schema.Types.ObjectId,
            ref: 'product',
            required: true
        },
        price:{
            type:Number
        },
    }]
});

module.exports = mongoose.model("cart", cartSchema);
