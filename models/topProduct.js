const mongoose = require('mongoose')

//topProduct schema
const topProductSchema = mongoose.Schema({
    title:{
        type: String,
    },
    slug:{
        type: String,
    },
    category:{
        type: String,
    },
    image:{
        type: String,
    },
    public_id:{
        type: String,
    },
    price:{
        type: Number,
    },
    discount:{
        type: Number,
    },
    disP:{
        type: Number
    }
});

const topProduct = module.exports = mongoose.model('topProduct', topProductSchema)