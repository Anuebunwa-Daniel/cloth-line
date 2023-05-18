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


//Get category index
router.get('/', async (req, res) => {
    var errors;
    if (req.session.errors) errors = req.session.errors;

    req.session.errors = null;

    try {
        const categories = await Category.find();
        res.render('admin/categories', {
            categories: categories
        });
    } catch (err) {
        console.log(err);
        res.status(500).send('Server Error');
    }
});

//Get add categories page
router.get('/add_category', async (req, res) => {
    const title = ""
    const categories = await Category.find();
    res.render('admin/add_category', {
        title: title
    })
})

//post add category
router.post('/add_category', upload.single('image'), [
    check('title', 'Title must have a value!').notEmpty(),

], async (req, res) => {
    const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'bigSteper/categories',
        width: 300,
        height: 300
    })

    const title = req.body.title
    const slug = title.replace(/\s+/g, '-').toLowerCase()
    const image = req.file

    const errors = validationResult(req)


    if ((!errors.isEmpty())) {
        res.render('admin/add_category', {
            errors: errors.array(),
            title: title,
            image: image
            // categories: Category
        })
    } else {
        try {
            const categories = await Category.findOne({ slug: slug })
            if (categories) {
                req.flash('danger', 'category title already exists, choose another')
                res.render('admin/add_category', {
                    title: title,
                    image: image
                })


            } else {

                const newcategory = new Category({
                    title: title,
                    slug: slug,
                    image: result.url,
                    public_id: result.public_id
                })
                await newcategory.save()
                req.flash('success', 'category added')
                res.redirect('/admin/categories')

            }


        } catch (err) {
            console.log(err)

        }
    }
})

//Get edit category
router.get('/edit_category/:id', async (req, res) => {
    const title = ''
    const image =''
    const category = await Category.findById(req.params.id)
    res.render('admin/edit_category', {
        title: category.title,
        id: category._id,
        image: category.image,
        category: category
    })
})

//post edit category 
router.post('/edit_category/:id', upload.single('image'),[
    check('title', 'Title must have a value!').notEmpty(),

], async (req, res) => {
    const title = req.body.title;
    const slug = title.replace(/\s+/g, '-').toLowerCase();
    const image = req.file
    const id = req.params.id;

    const errors = validationResult(req)


    if ((!errors.isEmpty())) {
        res.render('admin/edit_category', {
            errors: errors.array(),
            title: title,
            id: id
        })
    } else {
        try {
            const categories = await Category.findOne({ slug: slug, id: { '$ne': id } })
            if (categories) {
                req.flash('danger', 'category title already exists, choose another')
                res.render('admin/edit_category', {
                    title: title,
                    id: id
                })
            }

            if (!categories) {
                const cat = await Category.findById(req.params.id)
                const public_id = cat.public_id
                await cloudinary.uploader.destroy(public_id, function (error, result) {
                    console.log(result, error);
                });
            }

            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'bigSteper/categories',
                width: 300,
                height: 300
            })
            const cat = await Category.updateOne({ _id: id }, {
                 title: title,
                 slug: slug,
                 image: result.url,
                 public_id: result.public_id
                });
            req.flash('success', 'category edited')
            res.redirect('/admin/categories'); 



        } catch (err) {
            req.flash('danger', 'Error editing category');
            res.redirect('/admin/categories');
        }
    }
})


//delete categories
router.get('/delete-categories/:id', async (req, res) => {


    try {
        const cat = await Category.findById(req.params.id)
        const public_id = cat.public_id
        await cloudinary.uploader.destroy(public_id, function (error, result) {});

        const category = await Category.findByIdAndDelete(req.params.id)
        const categories = await Category.find()
        // req.app.locals.categories = categories
        req.flash('danger', 'category deleted')
        res.redirect('/admin/categories/')
    } catch (err) {
        console.log(err)
    }

})





module.exports = router