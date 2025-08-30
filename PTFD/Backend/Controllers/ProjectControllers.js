const Project = require("../Model/ProjectModel");

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
    const { pname, pnumber, pcode, plocation, pimg, ptype, pownerid, pownername, potelnumber, pdescription, ppriority, pbudget, pstatus, penddate ,pissues, pobservations } = req.body;

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
            pname, pnumber, pcode, plocation, ptype, pownerid, pownername, potelnumber,
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

exports.getAllProjects = getAllProjects;
exports.insertProject = insertProject;
exports.getProjectById = getProjectById;
exports.updateProject = updateProject;
exports.deleteProject = deleteProject;