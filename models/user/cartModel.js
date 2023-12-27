const mongoose = require("mongoose");
const { Schema } = mongoose;

const cartSchema = new mongoose.Schema({
    user: {
        type:Schema.Types.ObjectId,
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
        
    }]
});

module.exports = mongoose.model("cart", cartSchema);
