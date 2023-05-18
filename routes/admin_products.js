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
const Gallery = require('../models/gallery.js')
// const { Console } = require('console');

//Get product index
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find();
        const products = await Product.find();
        res.render('admin/products', {
            categories: categories,
            products: products
        });
    } catch (err) {
        console.log(err);
        res.status(500).send('Server Error');
    }
});

//Get add product
router.get('/add_products', async (req, res) => {
    const title = ''
    const desc = ''
    const price = ''
    const image = ''
    const categories = await Category.find()
    const products = await Product.find();
    res.render('admin/add_products', {
        title: products.title,
        desc: products.desc,
        price: products.price,
        id: products._id,
        image: products.image,
        categories: categories,
        products: products
    })
})

//post admin add product
router.post('/add_products', upload.single('image'), [
    check('title', 'Title must have a value!').notEmpty(),
    check('desc', 'Description must have a value!').notEmpty(),
    check('price', 'price must have a value!').notEmpty(),

], async (req, res) => {
    const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'bigSteper/products',
        width: 300,
        height: 300
    })

    const title = req.body.title
    const slug = title.replace(/\s+/g, '-').toLowerCase()
    const desc = req.body.desc
    const price = req.body.price
    const category = req.body.category
    const image = req.file

    const errors = validationResult(req)

    if ((!errors.isEmpty())) {
        res.render('admin/add_products', {
            errors: errors.array(),
            title: title,
            desc: desc,
            price: price,
            category: category,
            image: image

        })
    } else {
        try {
            const products = await Product.findOne({ slug: slug })
            const categories = await Category.find()
            if (products) {
                req.flash('danger', 'Product title already exists, choose another')
                res.render('admin/add_products', {
                    title: title,
                    desc: desc,
                    price: price,
                    image: image,
                    category: category,
                    categories: categories
                })
            } else {
                const newProduct = new Product({
                    title: title,
                    slug: slug,
                    desc: desc,
                    price: price,
                    image: result.url,
                    public_id: result.public_id,
                    category: category
                })
                await newProduct.save()
                req.flash('success', 'product added')
                res.redirect('/admin/products')
            }
        } catch (err) {
            console.log(err)
        }
    }
})

// get edit product page
router.get('/edit_products/:id', async (req, res) => {
    const title = ''
    const desc = ''
    const price = ''
    const image = ''
    const categories = await Category.find()
    const products = await Product.findById(req.params.id);
    res.render('admin/edit_products', {
        title: products.title,
        desc: products.desc,
        price: products.price,
        id: products._id,
        image: products.image,
        categories: categories,
        products: products,
        id: products.id,
        category: products.categories
    })
})

//post edit product page
router.post('/edit_products/:id', upload.single('image'), [
    check('title', 'Title must have a value!').notEmpty(),
    check('desc', 'Description must have a value!').notEmpty(),
    check('price', 'price must have a value!').notEmpty(),

], async (req, res) => {
    const title = req.body.title
    const slug = title.replace(/\s+/g, '-').toLowerCase()
    const desc = req.body.desc
    const price = req.body.price
    const category = req.body.category
    const image = req.file
    const id = req.params.id

    const errors = validationResult(req)
    if ((!errors.isEmpty())) {
        const categories = await Category.find()
        const products = await Product.findById(req.params.id);
        res.render('admin/edit_products', {
            errors: errors.array(),
            title: products.title,
            desc: products.desc,
            price: products.price,
            id: products._id,
            image: products.image,
            categories: categories,
            products: products,
            id: products.id,
            category: products.categories
        })
    } else {
     try{
            const categories = await Category.find()
            const products = await Product.findOne({ slug: slug, id: { '$ne': id } })

            if (products) {
                req.flash('danger', 'Product title already exists, choose another')
                res.render('admin/edit_products', {
                    title: products.title,
                    desc: products.desc,
                    price: products.price,
                    id: products._id,
                    image: products.image,
                    categories: categories,
                    products: products,
                    id: products.id,
                    category: products.categories
                })
            }

            if (!products) {
                const products = await Product.findById(req.params.id)
                const public_id = products.public_id
                await cloudinary.uploader.destroy(public_id, function (error, result) { });
            }
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'bigSteper/products',
                width: 300,
                height: 300
            })
            const pro = await Product.updateOne({ _id: id }, {
                title: title,
                slug: slug,
                image: result.url,
                public_id: result.public_id
            });

            const gallery = await Gallery.updateOne({title: pro.title},{
                title: title
            })

            req.flash('success', 'Product edited')
            res.redirect('/admin/products');

        }catch(err){
            req.flash('danger', 'Error editing product');
            res.redirect('/admin/products');
        }
      

    }

})

//get the add gallery page 
router.get('/add-gallery/:id', async (req, res) => {
    const id = req.params.id
  
    const products = await Product.find()
    const pro_id = products.id
    let gallery = await Gallery.findOne({ id: id })
    // console.log(gallery)

    if(gallery !== null){
        res.render('admin/add-gallery', {
            products: products,
            gallery: gallery,
            id: id
        })
    }
    if(gallery == null){
        res.render('admin/add-gallery', {
            products: products,
            gallery: gallery,
            id: id
        }) 
    }

})

//post the add gallery page
router.post('/add-gallery/:id', upload.array('file'), async (req, res) => {
    try {
        const files = req.files;
        let id = req.params.id;
        const product = await Product.findById(id);


        const result = await Promise.all(
            files.map((file) =>
                cloudinary.uploader.upload(file.path, {
                    folder: `bigSteper/${product.slug}`,
                    width: 300,
                    height: 300,
                })
            )
        );
        const imageArray = [];
        for (let i = 0; i < result.length; i++) {
            imageArray.push({
                url: result[i].url,
                public_id: result[i].public_id,
            });
        }
        let gallery = await Gallery.findOne({ title: product.slug })
        if (gallery) {
            gallery.images.push(...imageArray)
            await gallery.save()
        } else {

            const newGallery = new Gallery({
                id: id,
                title: product.slug,
                images: imageArray,
            });
            await newGallery.save();
        }

        req.flash('success', 'Gallery images added');
        res.redirect('/admin/products');
    } catch (err) {
        req.flash(
            'danger',
            'Something went wrong, make sure you are connected to the internet and try again'
        );
        res.redirect('/admin/products');
    }
});





//delete product
router.get('/delete-product/:id', async (req, res) => {


    try {
        const pro = await Product.findById(req.params.id)
        const public_id = pro.public_id
        await cloudinary.uploader.destroy(public_id, function (error, result) {
            console.log(result, error);
        });

        const product = await Product.findByIdAndDelete(req.params.id)
        req.flash('danger', 'product deleted')
        res.redirect('/admin/products/')
    } catch (err) {
        console.log(err)
    }

})





module.exports = router