const mongoose = require('mongoose')

//adminUser schema
const adminUserSchema = mongoose.Schema({

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


const adminUser = module.exports = mongoose.model('adminReg', adminUserSchema)