const express = require('express');
const router = express.Router();
const multer = require('multer')
const { cloudinary } = require('../utis/cloudinary')
const upload = require('../utis/multer')
const path = require('path')
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')

//get top product model
const TopProduct = require('../models/topProduct')
const Category = require('../models/category')
const testimony = require('../models/testimony');
const Product = require('../models/product')
const User = require('../models/user')


// get / page
router.get('/', async (req, res) => {
    // var errors;
    // if (req.session.errors) errors = req.session.errors;

    // req.session.errors = null;

    try {

        const categories = await Category.find()
        const products = await Product.find()
        const testimonies = await testimony.find()
        const topProduct = await TopProduct.find()
        const users = await User.find()
        const na = req.user
        const user = await User.findOne({ username: na })
        console.log(req.user)


        res.render('index', {
            title: 'Bigsteppers',
            categories: categories,
            testimonies: testimonies,
            topProduct: topProduct,
            user: user,
            products: products

        });

    } catch (err) {
        console.log(err);
        // res.status(500).send('Server Er');
    }
})


// get top product page
router.get('/topProduct', async (req, res) => {
    try {
        const categories = await Category.find()
        const products = await Product.find()
        const topProduct = await TopProduct.find()
        const user = await User.findOne()


        res.render('topProduct', {
            title: 'Top product',
            categories: categories,
            topProduct: topProduct,
            user: user,
            products: products

        });

    } catch (err) {
        // console.log(err);
        res.status(500).send('Server');
    }
})
router.post('/testimony', upload.single('image'), [
    check('name').notEmpty().withMessage('please kindly tell us your name'),
    check('comment', 'please kindly tell us what you think about our product or services').notEmpty(),

    //     check('image').notEmpty().withMessage('Please upload an image').custom((value, { req }) => {
    //       if (req.file == null) {

    //         throw new Error('Please upload an image file');
    //     }
    //     return true;
    //   }),
], async (req, res, next) => {

    console.log('new err  ' + req.file)
    const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'bigSteper/testimony',
        width: 400,
        height: 400
    })
    const name = req.body.name;
    const comment = req.body.comment;
    const image = req.file

    const errors = validationResult(req)

    if ((!errors.isEmpty())) {

        const categories = await Category.find();
        const testimonies = await testimony.find();
        const topProduct = await TopProduct.find()
        const user = await User.findOne()
        res.render('index', {
            errors: errors.array(),
            title: 'BigStepper',
            name: name,
            comment: comment,
            image: image,
            testimonies: testimonies,
            categories: categories,
            user: user,
            topProduct: topProduct
        })
    } else {
        try {

            const testimonies = await testimony.find();
            const categories = await Category.find();
            const topProduct = await TopProduct.find();
            const user = await User.findOne()

            const newTestimony = new testimony({
                name: name,
                comment: comment,
                image: result.url
            })
            await newTestimony.save()
            req.flash('success', 'Thank you for your honest review')
            res.redirect('/');
        } catch (err) {
            console.log(err)
            req.flash('danger', 'something went wrong, pls try again')
            res.redirect('/index')
        }
    }
})

// get the registration page
router.get('/registration', async (req, res) => {
    res.render('registration')
})

// post registration page

router.post('/registration', [
    check('firstName', 'first name must have a value!').notEmpty(),
    check('lastName', 'last name must have a value!').notEmpty(),
    check('username', 'username must have a value!').notEmpty(),
    check('email', 'Email must have a value!').notEmpty(),
    check('password', 'password must have a value!').notEmpty(),
    check('confirmPassword').notEmpty().withMessage('Confirm Password is required')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match');
            }
            return true;
        })

], async (req, res) => {

    const firstName = req.body.firstName
    const lastName = req.body.lastName
    const username = req.body.username
    const email = req.body.email
    const password = req.body.password

    const errors = validationResult(req)

    if ((!errors.isEmpty())) {
        res.render('registration', {
            errors: errors.array(),
            firstName: firstName,
            lastName: lastName,
            username: username,
            email: email,
            password: password

        })
    } else {
        try {
            const user = await User.findOne({ username: username })
            if (user) {
                req.flash('danger', 'Username already exists, choose another')
                res.render('registration', {
                    firstName: firstName,
                    lastName: lastName,
                    username: username,
                    email: email,
                    password: password
                })
            } else {
                const salt = await bcrypt.genSalt(10)
                const hashedPassword = await bcrypt.hash(password, salt)

                const newUser = new User({
                    firstName: firstName,
                    lastName: lastName,
                    username: username,
                    email: email,
                    password: hashedPassword
                })
                await newUser.save()
                const payload = {
                    user: {
                        email: req.body.email
                    }
                }
                const token = await jwt.sign(payload, 'user', {
                    expiresIn: '3600s'
                })
                res.cookie('token', token, {
                    httpOnly: false
                })
                res.redirect('login')
            }
        } catch (err) {
            console.log(err)
        }

    }

})

// get user login page
router.get('/login', async (req, res) => {
    res.render('login')
})

// post the user login
router.post('/login', [
    check('username', 'username must have a value!').notEmpty(),
    check('password', 'password must have a value!').notEmpty(),
    check('conpassword').notEmpty().withMessage('Confirm Password is required')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match');
            }
            return true;
        })
], async (req, res) => {

    const categories = await Category.find()
    const products = await Product.find()
    const testimonies = await testimony.find()
    const topProduct = await TopProduct.find()

    const username = req.body.username
    const password = req.body.password

    const errors = validationResult(req)

    if ((!errors.isEmpty())) {
        res.render('login', {
            errors: errors.array(),
            username: username,
            password: password
        })
    } else {
        try {
            const user = await User.findOne({ username: username })
            if (!user) {
                req.flash('danger', 'username not found')
                res.redirect('/login')

            } else {
                const validPass = bcrypt.compare(password, user.password)
                bcrypt.compare(password, user.password, (err, data) => {
                    if (data) {

                        const payload = {
                            user: {
                                username: user.username

                            }
                        }
                        const token = jwt.sign(payload, 'user', {
                            expiresIn: '3600s'
                        })
                        res.cookie('token', token, {
                            httpOnly: true
                        })
                    
                           res.render('index', {
                            user: user,
                            title: "BigStepper",
                            // name:user.username,
                            categories: categories,
                            testimonies: testimonies,
                            topProduct: topProduct,
                            // user: user,
                            products: products
                           })


                    } else {
                        req.flash('danger', " wrong password")
                        res.render('login')
                    }
                })
            }
        } catch (err) {
            console.log(err)
        }
    }

})

// get the logout route
router.get('/logout', (req, res) => {
    // const token = req.cookies.token;
    // console.log(token)
    res.cookie('token', '', { maxAge: 1 })
    res.redirect('/')
})




module.exports = router