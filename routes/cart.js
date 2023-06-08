const express = require('express');
const router = express.Router();
const session = require('express-session')
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cookieParser =require('cookie-parser')

//get product model
const Product = require('../models/product')
const Category =require('../models/category')
const TopProduct = require('../models/topProduct')
const User = require('../models/user')

// function protectRoute(req, res, next){
//     const token = req.cookies.token
//     try{
//         const user = jwt.verify(token, 'user')

//         req.user = user
//         // console.log(req.user)
//         next()
//     }
//     catch(err){
//         res.clearCookie('token')
//         req.flash('danger', 'You have to be logged in to view your cart')

//         req.session.lastPage = req.originalUrl;
//         return res.redirect('/')
//     }
// }


//Get add to cart
router.get('/add/:product', async(req,res)=>{
    try{
        const productSlug = req.params.product;
        const product = await Product.findOne({ slug: productSlug });
        const topProduct = await TopProduct.findOne({ slug: productSlug });
    
        let selectedProduct;
        if (product) {
          selectedProduct = product;
        } else if (topProduct) {
          selectedProduct = topProduct;
        } else {
          throw new Error('Product not found');
        }


    if (typeof req.session.cart == 'undefined') {
        req.session.cart = []
        req.session.cart.push({
            title: productSlug,
            qty: 1,
            price: parseFloat(selectedProduct.price).toFixed(2) ,
            image: selectedProduct.image 
        })
    }else{
     const  cart = req.session.cart
     let newItem = true
     for (let i = 0; i < cart.length; i++){
        if (cart[i].title == productSlug){
            cart[i].qty++
            newItem =false;
            break
        }
     }
     
     if (newItem){
        cart.push({
            title: productSlug,
            qty: 1,
            price: parseFloat(selectedProduct.price).toFixed(2) ,
            image: selectedProduct.image 
        })
     }
    }
    req.flash('success', 'product added to cart')
    res.redirect('back')

            
}catch(err){
    req.flash('danger', 'product not added, something went wrong')
    res.redirect('back')
}
})


//get checkout page
router.get('/checkout', async (req,res)=>{
    const categories = await Category.find()
    const topProduct = await TopProduct.find()
    const user = await User.findOne()
    if( req.session.cart && req.session.cart.length == 0){
        delete req.session.cart
        res.redirect('/cart/checkout')
    }else{
        res.render('checkout', {
            title: 'checkout',
            cart: req.session.cart,
            categories: categories,
            // user: user,
            topProduct: topProduct
        })
    }
})

//get update page
router.get ('/update/:product', (req, res)=>{
    const slug = req.params.product
    const cart = req.session.cart
    const action = req.query.action

    for(let i = 0; i < cart.length; i++) {
        if (cart[i].title == slug){
        
            if (action == "add"){
                cart[i].qty++
                req.flash('success', 'product added')
                res.redirect('/cart/checkout')
            }
           

        if (action == "remove"){
            cart[i].qty--
            if(cart[i].qty < 1){
                cart.splice(i, 1)
            }
            req.flash('success', 'product removed')
            res.redirect('/cart/checkout')
        }

        if(action == "clear"){
            cart.splice(i, 1)

            if(cart.length == 0){
                delete req.session.cart
            }
            req.flash('success', 'cart cleared')
            res.redirect('/cart/checkout')
        }


        }
    }
})

// get clear cart 
router.get('/clear', (req,res)=>{
    delete req.session.cart
    req.flash('success', 'cart cleared ')
    res.redirect('/cart/checkout')
})

router.get('/buy', (req,res)=>{
    delete req.session.cart;
    res.sendStatus(200)
})




module.exports = router