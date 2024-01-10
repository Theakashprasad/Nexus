const mongoose = require("mongoose");
const { Schema } = mongoose;

const wishlistSchema = new mongoose.Schema({
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
        
    }]
});

module.exports = mongoose.model("wishlist", wishlistSchema);
