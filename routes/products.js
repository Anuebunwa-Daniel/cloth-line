const express = require('express');
const router = express.Router();


//get product model
const Product = require('../models/product')
//get category model
const Category = require('../models/category')
//get the gallery model 
const Gallery = require('../models/gallery')
// get the top product model 
const TopProduct = require('../models/topProduct')
const User = require('../models/user')

// get all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find()
        const categories = await Category.find()
        const user = await User.findOne()

        res.render('all_products', {
            title: 'All products',
            products: products,
            user: user,
            categories: categories
        })
    } catch (err) {
        // console.log(err);
        res.status(500).send('Server Error');
    }

})


// get a page
router.get('/:category', async (req, res) => {
    try {
        const categories = await Category.find()
        const catSlug = req.params.category
        const cat = await Category.findOne({ slug: catSlug })

        const products = await Product.find({ category: catSlug })

        res.render('category', {
            title: cat.title,
            categories: categories,
            products: products

        })
    } catch (err) {
        // console.log(err);
        res.status(500).send('Server Error');
    }
})


// get product details
router.get('/:category/:product', async (req, res) => {

    const product = await Product.findOne({ slug: req.params.product });
    const categories = await Category.find()
    
    if (!product) {
        return  res.redirect(req.get('Referer'));
    }
    const slug = product.slug
    if (slug) {
        const gallery = await Gallery.findOne({ title: slug })
   
    if (gallery) {
        res.render('product', {
            title: product.title,
            gallery: gallery,
            p: product,
            categories: categories
        })
    } else {
        const categories = await Category.find()
        const catSlug = req.params.category
        const cat = await Category.findOne({ slug: catSlug })

        const products = await Product.find({ category: catSlug })
        req.flash('danger', 'sorry, the product has no more images to view')
        res.redirect(req.get('Referer'))
       
    }
} 

})


module.exports = router