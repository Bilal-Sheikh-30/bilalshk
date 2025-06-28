const express = require('express');
const router = express.Router();
const cloudinary = require('../config/cloudinaryConfig');
const { Project, ProjectDescription } = require('../models/portfolio.model')
const jwt = require('jsonwebtoken');
const {isme} = require('../middlewares/auth')

router.get('/panel',isme,(req, res) =>{
    res.render('panel');
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', (req, res) => {
    const user_pw = req.body.password.trim();
    if (process.env.PASSWORD === user_pw) {
        const token = jwt.sign({
            user: 'admin'
        }, process.env.JWT_SECRET)
        res.cookie('token', token)
        res.redirect('/dashboard/panel');
    }else{
        res.status(201).json({message: 'not authorized'});
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/dashboard/login');
});

router.get('/add_project',isme,(req, res) => {
    res.render('newProject');
});

router.post('/add_project', (req, res) => {
    const data = req.body;
    console.log(data);
    res.status(200).json({message: 'got your data'});
});


module.exports = router;