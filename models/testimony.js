const mongoose = require('mongoose')

//testimony  schema
const testimonySchema = mongoose.Schema({
    name:{
        type: String,
        require: true
    },
    comment:{
        type: String,
        require: true
    },
    image:{
        type: String,
    }
   
});

const Testimony = module.exports = mongoose.model('Testimony', testimonySchema)