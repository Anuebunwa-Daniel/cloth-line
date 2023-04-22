const express = require('express');
const router = express.Router();
const multer = require('multer')
const { cloudinary } = require('../utis/cloudinary')
const upload = require('../utis/multer')
const path = require('path')
const { check, validationResult } = require('express-validator');

//get top product model
const TopProduct = require('../models/topProduct')
const Category = require('../models/category')
const testimony = require('../models/testimony');


// get / page
router.get('/', async (req, res) => {
    var errors;
    if (req.session.errors) errors = req.session.errors;

    req.session.errors = null;

    try {
        const categories = await Category.find()
        const testimonies = await testimony.find()
        const topProduct = await TopProduct.find()


        res.render('index', {
            title: 'Bigsteppers',
            categories: categories,
            testimonies: testimonies,
            topProduct: topProduct

        });

    } catch (err) {
        // console.log(err);
        res.status(500).send('Server Error');
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

    console.log( 'new err  ' + req.file)
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
        res.render('index', {
            errors: errors.array(),
            title: 'BigStepper',
            name: name,
            comment: comment,
            image: image,
            testimonies: testimonies,
            categories: categories,
            topProduct: topProduct
        })
    } else {
        try {

            const testimonies = await testimony.find();
            const categories = await Category.find();
            const topProduct = await TopProduct.find();

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


module.exports = router