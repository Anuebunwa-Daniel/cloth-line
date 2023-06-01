const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cookieParser =require('cookie-parser')

const AdminU = require('../models/adminUser');


// get the registration page
router.get('/', async(req,res)=>{
    res.render('admin/admin-registration',{

    })
})

// post the registration page
router.post('/admin-registration',  [
    check('firstName', 'first name must have a value!').notEmpty(),
    check('lastName', 'last name must have a value!').notEmpty(),
    check('username', 'username must have a value!').notEmpty(),
    check('email', 'Email must have a value!').notEmpty(),
    check('password', 'password must have a value!').notEmpty(),
    check('confirmPassword').notEmpty() .withMessage('Confirm Password is required')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })

],async(req, res)=>{

    const firstName = req.body.firstName
    const lastName = req.body.lastName
    const username = req.body.username
    const email = req.body.email
    const password = req.body.password

    const errors = validationResult(req)

    if ((!errors.isEmpty())) {
        res.render('admin/admin-registration', {
            errors: errors.array(),
            firstName: firstName,
            lastName: lastName,
            username: username,
            email: email,
            password: password

        })
    }else{
        try{
            const adminU = await AdminU.findOne ({username: username})
            if(adminU){
                req.flash('danger', 'Username already exists, choose another')
                res.render('admin/admin-registration', {
                    firstName: firstName,
                    lastName: lastName,
                    username: username,
                    email: email,
                    password: password
                })
            }else{
                const salt = await bcrypt.genSalt(10)
                const hashedPassword = await bcrypt.hash(password, salt)

                const newReg = new AdminU ({
                    firstName: firstName,
                    lastName: lastName,
                    username: username,
                    email: email,
                    password: hashedPassword
                })
                await newReg.save()
                const payload ={
                    user:{
                        email:req.body.email
                    }
                }
                const token = await jwt.sign(payload, 'admin',{
                    expiresIn:'3600s'
                })
                res.cookie('token', token,{
                    httpOnly: false
                })
                res.redirect('login')
            }
        }catch(err){
            console.log(err)
        }

    }
})

// get the admin login page
router.get ('/login', async(req, res)=>{

    res.render('admin/login')
})


// post the admin login page
router.post('/login',  [
    check('username', 'username must have a value!').notEmpty(),
    check('password', 'password must have a value!').notEmpty(),
    check('conpassword').notEmpty() .withMessage('Confirm Password is required')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
    ], async(req, res)=>{

    const username = req.body.username
    const password = req.body.password

    const errors = validationResult(req)

    if ((!errors.isEmpty())) {
        res.render('admin/login', {
            errors: errors.array(),
            username: username,
            password: password
        })
    }else{
        try{
        const adminU = await AdminU.findOne({username: username})
        if(!adminU){
            req.flash('danger', 'username not found')
               res.redirect('/admin/login')

        }  else{
            const validPass = bcrypt.compare(password, adminU.password)
            bcrypt.compare(password, adminU.password, (err, data)=>{
                if(data){

                    const payload ={
                       user:{
                           username:adminU.username
                           
                       }
                   }
                   const token = jwt.sign(payload, 'admin', {
                       expiresIn: '3600s'
                   })
                   res.cookie('token', token, {
                       httpOnly:true
                   })
                   res.redirect('/admin/products/home' )
                }else{
                    req.flash('danger', " wrong password")
                    res.render('admin/login')
                }
            })
           }
        }catch(err){
            console.log(err)
        }
    }

})

// get the logout route
router.get('/logout', (req, res)=>{
    console.log(token)
    res.cookie('token', '',{maxAge: 1})
    res.redirect('/admin/adminUser/login')
 })

module.exports = router