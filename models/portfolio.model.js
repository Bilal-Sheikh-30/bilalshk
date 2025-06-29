const mongoose = require("mongoose");

// Project Card
const ProjectSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: true
  },
  media: {
    type: [String]
  },
  overview: {
    type: String,
    trim: true
  },
  visibility:{
    type: String,
    enum: ['public', 'private']
  }
});

// Detailed Project Description
const ProjectDescriptionSchema = new mongoose.Schema({
  project_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  detailed_overview: {
    type: String,
    trim: true
  },
  features: {
    type: [String], 
    trim: true
  },
  tech_stack: {
    frontend: {
    type: [String],
    default: []
    },
    backend: {
    type: [String],
    default: []
    },
    db: {
    type: [String],
    default: []
    }
  },
  link: {
    type: String,
    trim: true
  },
  my_role: {
    type: String,
    trim: true
  },
  project_type:{
    type: String,
    trim: true
  }
});


const Project = mongoose.model('Project', ProjectSchema);
const ProjectDescription = mongoose.model('ProjectDescription', ProjectDescriptionSchema);

module.exports = {
  Project,
  ProjectDescription
};
