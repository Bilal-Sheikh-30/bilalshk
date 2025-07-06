const express = require('express');
const { default: mongoose } = require('mongoose');
const router = express.Router()
const { Project, ProjectDescription } = require('../models/portfolio.model')
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465, // or 587 if secure is false
    secure: true, // true for port 465
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
//     tls: {
//     // ↓↓ TEMPORARY FOR HOSTS LIKE RENDER
//     rejectUnauthorized: false 
//   }
});

router.post('/contact-bilal',async (req, res) =>{
    const {name, email, msg} = req.body;
    const mailOptions = {
        from: email,
        to: process.env.EMAIL_USER,
        subject: `portfolio - msg from ${name} via contact form.`,
        text: msg 
    };
    try {
        await transporter.sendMail(mailOptions)
        res.send('Message sent to Bilal')
    } catch (error) {
        console.log('Error sending mail: ', error)
        res.status(500).send('Failed to send your msg. ')        
    }
})

router.get('/',async (req, res) => {
    try {
        let projects = await Project.find({visibility: 'public'}).sort({ _id: -1})
        // send 3 recent projects
        projects = projects.slice(0,3);
        res.render('index', {projects});
        
    } catch (error) {
        res.status(500).json('something went wrong :(')
        console.log(error)
    }
});

router.get('/about', (req, res) => {
    res.render('about');
});

router.get('/contact', (req, res) => {
    res.render('contact');
});

router.get('/projects',async (req, res) => {
    try {
        // send all public projects
        const projects = await Project.find({visibility: 'public'}).sort({ _id: -1})
        res.render('projects', {projects});
        
    } catch (error) {
        res.status(500).json('something went wrong :(')
    }
});

module.exports = router;