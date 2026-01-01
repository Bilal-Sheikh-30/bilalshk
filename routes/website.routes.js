const express = require('express');
const { default: mongoose } = require('mongoose');
const router = express.Router()
const { Project, ProjectDescription } = require('../models/portfolio.model')

const mailjet = require('node-mailjet')
  .apiConnect(
    process.env.MAILJET_API_KEY,
    process.env.MAILJET_SECRET_KEY
  );


router.post('/contact-bilal', async (req, res) => {
  const { name, email, msg } = req.body;

  try {
    await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: process.env.EMAIL_USER,
            Name: 'Portfolio Contact'
          },
          To: [
            {
              Email: process.env.EMAIL_USER,
              Name: 'Bilal'
            }
          ],
          ReplyTo: {
            Email: email,
            Name: name
          },
          Subject: 'Msg from portfolio contact form',
          TextPart: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${msg}`
        }
      ]
    });

    res.render('contact_status', { status: 'success', contact_person_name: name });
  } catch (error) {
    console.log('Mailjet error:', error);
    res.render('contact_status', { status: 'failed', contact_person_name: name });
  }
});



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

router.get('/get_project/:proj_id',async (req, res) => {
    try {
        const proj = await Project.findById(req.params.proj_id);
        const proj_descp = await ProjectDescription.findOne({project_id: req.params.proj_id})
        res.render('proj_descp', {proj, proj_descp});
    } catch (error) {
        res.status(500).json('Failed to fetch data.')
    }
})

router.get('/ping', (req, res) => {
    res.status(200).send('pinged!')
})
module.exports = router;