const express = require('express')
const ejs = require('ejs')
const config = require('./config/database')
const mongoose = require('mongoose')
const path = require('path')
const bodyParser =require('body-parser')
const router = express.Router();
const session = require('express-session')
const mkdirp = require('mkdirp')
const fs = require('fs-extra')
const resizeImg = require('resize-img')
const {check,validationResult} = require('express-validator');
// const configureFileUpload = require('./utis/uploadfile');
// const passport = require('passport')
const multer =require('multer')
const {cloudinary} =require('./utis/cloudinary')
const upload = require('./utis/multer')



mongoose.connect (config.database)

.then(()=>{
    console.log('Database connected successfully')
})

.catch((err)=>{
    console.log (err +'Database connection failed')
})

const app = express()


// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// set public folder
app.use(express.static(path.join(__dirname, 'public')))

//set global errors variable
app.locals.errors = null

//get category Model
var Category = require('./models/category')
//get all pages to pass to header.ejs
const categories = Category.find()
app.locals.categories = categories



//body parser middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

//Expree session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    cookie: { secure: true }
}))





// const validateFile = [
//     check('image').notEmpty().withMessage('Please upload an image'),
//   ];
// app.use(expressValidator({
//     errorFormatter: function (param, msg, value) {
//         var namespace = param.split('.')
//             , root = namespace.shift()
//             , formParam = root
//         while (namespace.length) {
//             formParam += '[' + namespace.shift() + ']'
//         }
//         return {
//             param: formParam,
//             msg: msg,
//             value: value
//         }

//     },
//     customValidators: {
//         isImage: (value, filename) => {
//             var extension = (path.extname(filename)).toLowerCase();

//             switch (extension) {
//                 case '.jpg':
//                     return '.jpg';
//                 case '.jpeg':
//                     return '.jpeg';
//                 case '.png':
//                     return '.png';
//                 case '':
//                     return '.jpg';
//                 default:
//                     return false;
//             }
//         }
//     }


// }))

//Express message middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// set router
// for the front end
const pages = require("./routes/pages.js")
// for the admin area
const topProduct = require("./routes/topProducts.js")
const adminCategories = require("./routes/admin_categories.js")
const adminProducts = require("./routes/admin_products.js")


// for the front end
app.use('/', pages)


// for the admin area
app.use('/admin/topProducts', topProduct)
app.use('/admin/categories', adminCategories)
app.use('/admin/products', adminProducts)



//listenning to the server
const port = 4000;
app.listen(port, ()=>{
    console.log ('server connect to port' + ' ' + port)
})