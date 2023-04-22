const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const multer = require('multer')
const { cloudinary } = require('../utis/cloudinary')
const upload = require('../utis/multer')
const path = require('path')
// var auth = require('../config/auth')
// var isAdmin = auth.isAdmin

//get page model
const Category = require('../models/category')
const topProduct = require('../models/topProduct');
const category = require('../models/category');



//Get top product index
router.get('/', async (req, res) => {
    try {
        const topPro = await topProduct.find();
        const categories = await Category.find()
        res.render('admin/topProduct', {
            topPro: topPro,
            categories: categories
        });
    } catch (err) {
        console.log(err);
        res.status(500).send('Server Error');
    }
});

//Get add top product page
router.get('/add_topProduct', async (req, res) => {
    const title = ""
    const price = ""
    const discount = ""
    const categories = await Category.find()
    const topPro = await topProduct.find()
    res.render('admin/add_topProduct', {
        title: title,
        price: price,
        discount: discount,
        categories: categories,
        topPro: topPro
    })
})

//post add top product
router.post('/add_topProduct', upload.single('image2'), [
    check('title', 'Title must have a value!').notEmpty(),
    check('price', 'Price must have a value!').notEmpty(),
    check('discount', 'Discount must have a value!').notEmpty(),

], async (req, res, next) => {
    const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'bigSteper/topProducts',
        width: 300,
        height: 300
    })
    const title = req.body.title
    const slug = title.replace(/\s+/g, '-').toLowerCase()
    const price = req.body.price
    const category = req.body.category
    const discount = req.body.discount
    const image = req.file
    
    const errors = validationResult(req)

    if ((!errors.isEmpty())) {
        const categories = await Category.find()

        const topPro = await topProduct.find()
        res.render('admin/add_topProduct', {
            errors: errors.array(),
            title: title,
            slug: slug,
            price: price,
            discount: discount,
            image: image,
            categories: categories,
            topPro: topPro
        })
    } else {
        try {
            const topPro = await topProduct.findOne({ slug: slug })
            cat = await Category.find()
            if (topPro) {
                req.flash('danger', 'Title already exists, choose another')
                res.render('admin/add_topProduct', {
                    title: title,
                    price: price,
                    discount: discount,
                    image: image,
                    categories: cat,
                    topPro: topPro
                })
            } else {
                const mainPrice = parseFloat(price).toFixed(2)
                const newtopPro = new topProduct({
                    title: title,
                    slug: slug,
                    category: category,
                    price: mainPrice,
                    discount: discount,
                    image: result.url,
                    public_id: result.public_id

                })
                await newtopPro.save()
                const categories = await Category.find()
                const topPro = await topProduct.find()
                req.flash('success', 'top product added')
                res.render('admin/topProduct', {
                    title: title,
                    slug: slug,
                    price: price,
                    discount: discount,
                    image: image,
                    categories: categories,
                    topPro: topPro
                })
            }
 

        } catch (err) {
            console.log(err)
            req.flash('danger', 'something went wrong, pls try again')
            res.redirect('/admin/topProducts/add_topProduct')

        }
    }
})

// get edit top product
router.get('/edit_topProduct/:id', async (req, res) => {
    const title = ""
    const price = ""
    const discount = ""
    const image = ""
    const categories = await Category.find()
    const topPro = await topProduct.findById(req.params.id)
    res.render('admin/edit_topProduct', {
        title: topPro.title,
        price: topPro.price,
        discount: topPro.discount,
        image: topPro.image,
        categories: categories,
        topPro: topPro,
        id: topPro._id
    })
})

// post edit top product 
router.post('/edit_topProduct/:id',upload.single('image2'), [
    check('title', 'Title must have a value!').notEmpty(),
    check('price', 'Price must have a value!').notEmpty(),
    check('discount', 'Discount must have a value!').notEmpty(),

], async (req, res) => {
   

    const title = req.body.title;
    const slug =  title.replace(/\s+/g, '-').toLowerCase();
    const price =req.body.price;
    const discount = req.body.discount;
    const image = req.file;
    const id = req.params.id;

    const errors = validationResult(req)

    if((!errors.isEmpty())){
        const categories = await Category.find()
        const top = await topProduct.find()
        res.render('admin/edit_topProduct',{
            errors:errors.array(),
            title: title,
            price: price,
            image: image,
            discount: discount,
            categories: categories,
            id: id

        })
    }
        try{
            const categories = await Category.find()
            // const top = await topProduct.find()
            const topPro = await topProduct.findOne({slug:slug, id:{'$ne':id}})
            if(topPro){
                req.flash('danger', 'Top product title already exists, choose another')
                res.render('admin/edit_topProduct',{
                    title: title,
                    price: price,
                    discount: discount,
                    categories: categories,
                    topPro: topPro,
                    image: image,
                    id: id
                })
            }

            if(!topPro){
                const topPr =await topProduct.findById(req.params.id)
                const public_id = topPr.public_id
                await cloudinary.uploader.destroy(public_id, function (error, result) {
                    console.log(result, error);
                });
            }
            
             

                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'bigSteper/topProducts',
                    width: 300,
                    height: 300
                })

                // const category = await Category.find() 
                // console.log(category)
                const mainPrice = parseFloat(price).toFixed(2)
                const top = await topProduct.updateOne({_id:id},{
                    title: title,
                    slug: slug,
                    // category: category,
                    price: mainPrice,
                    discount: discount,
                    image: result.url,
                    public_id: result.public_id, 
                    id: id 
                })
                console.log(top)
                req.flash('success', 'Top product edited')
                res.redirect('/admin/topProducts')


            
        }catch(err){
            // console.log(err)
            req.flash('danger', 'Error editing category');
            res.redirect('/admin/topProducts');
        }
})

//delete categories
router.get('/delete-topProduct/:id', async (req, res) => {
    const pro = await topProduct.find()
    try {
    const topPro =await topProduct.findById(req.params.id)
    const public_id = topPro.public_id
    cloudinary.uploader.destroy(public_id, function (error, result) {
        console.log(result, error);
    });
    
      await topProduct.findByIdAndDelete(req.params.id)
        req.flash('danger', 'Product deleted')
        res.redirect('/admin/topProducts/')
    } catch (err) {
        console.log(err)
    }

})





module.exports = router