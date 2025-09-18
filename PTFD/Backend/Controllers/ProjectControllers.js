const Project = require("../Model/ProjectModel");
const nodemailer = require('nodemailer');
const twilio = require('twilio');

const getAllProjects = async (req, res, next) => {

    let projects;

    // get all projects
    try {
        projects = await Project.find();
    }catch (err) {
        console.log(err);
    }
    // if no projects found
    if (!projects || projects.length === 0) {
        return res.status(404).json({ message: "No projects found" });
      }
      
    // Display all projects
    return res.status(200).json({ projects });
};

// Data insert

const insertProject = async (req, res, next) => {
    const { pname, pnumber, pcode, plocation, pimg, ptype, pownerid, pownername, potelnumber, powmail, pdescription, ppriority, pbudget, pstatus, penddate ,pissues, pobservations } = req.body;

    let project;
    try {
        // Validate required fields
        if (!pname || !pnumber || !pcode || !plocation || !ptype || !pownerid || !pownername || !potelnumber || !pdescription || !ppriority || !pbudget || !pstatus || !penddate) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Validate images array
        if (!pimg || !Array.isArray(pimg) || pimg.length === 0) {
            return res.status(400).json({ message: "At least one project image is required" });
        }

        console.log('Creating project with data:', {
            pname, pnumber, pcode, plocation, ptype, pownerid, pownername, potelnumber, powmail,
            pdescription, ppriority, pbudget, pstatus, penddate,
            pissues: pissues?.length || 0,
            pobservations: pobservations ? 'provided' : 'not provided',
            pimg: `${pimg.length} images`
        });

        project = new Project({
            pname,
            pnumber,
            pcode,
            plocation,
            pimg,
            ptype,
            pownerid,
            pownername,
            potelnumber,
            powmail,
            pdescription,
            ppriority,
            pbudget,
            pstatus,
            penddate,
            pissues,
            pobservations
        });
        await project.save();
        console.log('Project created successfully:', project._id);
    } catch (err) {
        console.error('Error creating project:', err);
        return res.status(500).json({ message: err.message || "Error creating project" });
    }
    // if project not created
    if (!project) {
        return res.status(404).json({ message: "Unable to create project" });
    }
    return res.status(200).json({ project });
}

// Get Projects by ID

const getProjectById = async (req, res, next) => {
    
    const projectId = req.params.id;

    let project;

    try{
        project = await Project.findById(projectId);
    } catch (err) {
        console.log(err);
    }
    // if project not found
    if (!project) {
        return res.status(404).json({ message: "Project not found" });
    }
    return res.status(200).json({ project });
}

// Update project
const updateProject = async (req, res) => {
    const { id } = req.params;
    try {
      const updatedProject = await Project.findByIdAndUpdate(
        id,
        {
          ...req.body,
          pupdatedat: Date.now(),   // 🔥 always refresh update timestamp
        },
        { new: true } // return updated doc
      );
  
      if (!updatedProject) {
        return res.status(404).json({ message: "Project not found" });
      }
  
      res.json(updatedProject);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  
  
// Delete Project

 const deleteProject = async (req, res, next) => {

    const projectId = req.params.id;

    let project;

    try {
        project = await Project.findByIdAndDelete(projectId);
    } catch (err) {
        console.log(err);
    }
    // if project not found
    if (!project) {
        return res.status(404).json({ message: "Project not found" });
    }
    return res.status(200).json({ message: "Project deleted successfully" });
 }

 // Nodemailer transport (use env vars)
const mailTransport = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : 587,
  secure: process.env.EMAIL_SECURE === 'true', // true for 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Twilio client
const twilioClient = (process.env.TWILIO_SID && process.env.TWILIO_AUTH)
  ? twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH)
  : null;

  async function sendProjectEmail(to, project, action = 'created') {
  if (!to || !mailTransport) return;
  const subject = `Project ${action}: ${project.pname}`;
  const html = `
    <p>Hi ${project.pownername || 'Owner'},</p>
    <p>Your project <strong>${project.pname}</strong> (ref: ${project.pnumber}) was ${action} successfully.</p>
    <ul>
      <li>Code: ${project.pcode}</li>
      <li>Location: ${project.plocation}</li>
    </ul>
    <p>Regards,<br/>ConstructPro</p>
  `;
  try {
    const info = await mailTransport.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
    console.log('Email sent:', info.messageId || info);
    return info;
  } catch (err) {
    console.error('Email send error:', err);
  }
}

async function sendProjectSMS(to, project, action = 'created') {
  if (!to || !twilioClient) return;
  try {
    const msg = await twilioClient.messages.create({
      body: `✅ Project ${action}: ${project.pname} (${project.pnumber})`,
      from: process.env.TWILIO_PHONE,
      to,
    });
    console.log('SMS sent:', msg.sid);
    return msg;
  } catch (err) {
    console.error('SMS send error:', err);
  }
}


exports.getAllProjects = getAllProjects;
exports.insertProject = insertProject;
exports.getProjectById = getProjectById;
exports.updateProject = updateProject;
exports.deleteProject = deleteProject;