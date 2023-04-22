const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

const multer = require('multer')
const { cloudinary } = require('../utis/cloudinary')
const upload = require('../utis/multer')
const path = require('path');
const { models } = require('mongoose');

// get the models
const Category = require('../models/category')
const Product = require('../models/product.js')

//Get product index
router.get('/', async(req,res)=>{
    try {
        const categories = await Category.find();
        const products = await Product.find();
        res.render('admin/categories', {
            categories: categories,
            products: products
        });
    } catch (err) {
        console.log(err);
        res.status(500).send('Server Error');
    }
});

//Get add product
router.get('/add_product', async(req,res)=>{
    const title = ''
    const desc = ''
    const price = ''
    const image =''
    const category = await Category.findById()
    const products = await Product.find();
    res.render('admin/add_products', {
        title: products.title,
        id: products._id,
        image: products.image,
        category: category,
        products: products
    })
})






module.exports = router