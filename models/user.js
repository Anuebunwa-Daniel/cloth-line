const mongoose = require('mongoose')

//adminUser schema
const userSchema = mongoose.Schema({

    firstName :{
        type: String,
        require: true
    },
    lastName:{
        type: String,
        require: true
    },
    username:{
        type:String,
        require: true
    },
    email:{
        type:String,
        require: true
    },
    password:{
        type:String,
        require: true
    }
})


const user = module.exports = mongoose.model('user', userSchema)