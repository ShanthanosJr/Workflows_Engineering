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
    const { pname, pcode, pownerid, pownername, pdescription, pbudget, pstatus, penddate } = req.body;

    let project;
    try {
        project = new Project({
            pname,
            pcode,
            pownerid,
            pownername,
            pdescription,
            pbudget,
            pstatus,
            penddate
        });
        await project.save();
    } catch (err) {
        console.log(err);
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

// Update Project

const updateProject = async (req, res, next) => {
    const projectId = req.params.id;
  
    try {
      const project = await Project.findByIdAndUpdate(
        projectId,
        req.body,                       // update only fields sent by client
        { new: true, runValidators: true } // return updated doc + validate
      );
  
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
  
      return res.status(200).json({ project });
    } catch (err) {
      console.error("Error updating project:", err);
      return res.status(500).json({ message: "Server error", error: err.message });
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