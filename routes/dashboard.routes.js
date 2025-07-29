const express = require('express');
const router = express.Router();
const cloudinary = require('../config/cloudinaryConfig');
const { Project, ProjectDescription } = require('../models/portfolio.model')
const jwt = require('jsonwebtoken');
const {isme} = require('../middlewares/auth')
const multer = require('multer');
const streamifier = require('streamifier');
const upload = multer();

router.get('/panel',isme, async (req, res) =>{
  try {
    // recent added first
    const projects = await Project.find().sort({ _id: -1 });
    res.render('panel', {projects});
    
  } catch (error) {
    console.error(error);
    res.status(500).send('Error loading dashboard.')
  }
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

router.get('/project/:id', isme, async (req, res) => {
  const proj_id = req.params.id
  try {
    const project = await Project.findById(proj_id);
    const proj_descp = await ProjectDescription.find({project_id: proj_id});
    res.render('newProject', {newProj: false, project, proj_descp})
  } catch (error) {
    console.error(error)
    res.status(500).send('can not get data')
  }
});

router.get('/add_project',isme,(req, res) => {
    res.render('newProject', {'newProj': true, project: {}, proj_descp: [{}]});
});

router.post('/add_project', isme, upload.array('media'), async (req, res) => {
  try {
    const files = req.files;
    const body = req.body;

    const uploadedUrls = [];

    // Upload each file (image or video) to Cloudinary
    for (const file of files) {
      const resourceType = file.mimetype.startsWith('video/') ? 'video' : 'image';

      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: resourceType, folder: 'portfolio_projects' },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        );
        streamifier.createReadStream(file.buffer).pipe(stream);
      });

      uploadedUrls.push(uploadResult.secure_url);
    }

    // Save basic project data (no media type needed)
    const newProject = new Project({
      title: body.title,
      media: uploadedUrls,
      overview: body.summary, // frontend field 'summary' → 'overview'
      visibility: body.visibility
    });

    const savedProject = await newProject.save();

    // Helper to split comma-separated values into arrays
    const parseField = (value) =>
      typeof value === 'string' ? value.split(';').map(str => str.trim()) : [];

    // Save detailed project description
    const newProjectDesc = new ProjectDescription({
      project_id: savedProject._id,
      detailed_overview: body.overview, // frontend field 'overview' → 'detailed_overview'
      features: parseField(body.features),
      tech_stack: {
        frontend: parseField(body.tech_frontend),
        backend: parseField(body.tech_backend),
        db: parseField(body.tech_db)
      },
      link: body.github_link,
      my_role: body.my_role,
      project_type: body.project_type
    });

    await newProjectDesc.save();

    res.status(201).json({ message: 'Project added successfully!' });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/edit_project/:id', isme, upload.array('media'), async (req, res) => {
  try {
    const projectId = req.params.id;
    const files = req.files;
    const body = req.body;

    // Get existing project and description
    const existingProject = await Project.findById(projectId);
    const existingDesc = await ProjectDescription.findOne({ project_id: projectId });

    if (!existingProject || !existingDesc) {
      return res.status(404).json({ message: 'Project not found' });
    }

    let uploadedUrls = existingProject.media || [];

    if (files.length > 0) {
      // Delete old media from Cloudinary
      const deletePublicId = (url) => {
        const segments = url.split('/');
        const publicId = segments.slice(-1)[0].split('.')[0];
        return `portfolio_projects/${publicId}`;
      };

      if (Array.isArray(existingProject.media)) {
        for (const mediaUrl of existingProject.media) {
          const resourceType = mediaUrl.match(/\.(mp4|webm|ogg)$/) ? 'video' : 'image';
          const publicId = deletePublicId(mediaUrl);
          await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
        }
      }

      // Upload new media
      uploadedUrls = [];
      for (const file of files) {
        const resourceType = file.mimetype.startsWith('video/') ? 'video' : 'image';
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: resourceType, folder: 'portfolio_projects' },
            (err, result) => {
              if (err) reject(err);
              else resolve(result);
            }
          );
          streamifier.createReadStream(file.buffer).pipe(stream);
        });
        uploadedUrls.push(uploadResult.secure_url);
      }
    }

    // Update Project
    existingProject.title = body.title;
    existingProject.media = uploadedUrls;
    existingProject.overview = body.summary;
    existingProject.visibility = body.visibility;
    await existingProject.save();

    // Convert comma-separated strings to arrays (if not already arrays)
    const parseField = (value) => typeof value === 'string' ? value.split(';').map(str => str.trim()) : [];

    // Update Project Description
    existingDesc.detailed_overview = body.overview;
    existingDesc.features = parseField(body.features);
    existingDesc.tech_stack.frontend = parseField(body.tech_frontend);
    existingDesc.tech_stack.backend = parseField(body.tech_backend);
    existingDesc.tech_stack.db = parseField(body.tech_db);
    existingDesc.link = body.github_link;
    existingDesc.my_role = body.my_role;
    existingDesc.project_type = body.project_type;
    await existingDesc.save();

    res.status(200).json({ message: 'Project updated successfully' });

  } catch (error) {
    console.error('Edit error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});




module.exports = router;