import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Nav from "../Nav/Nav";

function UpdateProjects() {
  const [project, setProject] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    async function fetchProject() {
      try {
        const res = await axios.get(`http://localhost:5050/projects/${id}`);
        // Handle both cases (wrapped or plain project)
        const projectData = res.data.project || res.data;
        
        // Process issues array for display
        if (projectData.pissues && Array.isArray(projectData.pissues)) {
          projectData.pissues = projectData.pissues.join(", ");
        }
        
        setProject(projectData);
      } catch (err) {
        console.error("Error fetching project:", err);
        setMessage("❌ Failed to load project data.");
      } finally {
        setLoading(false);
      }
    }
    fetchProject();
  }, [id]);

  const sendRequest = async () => {
    try {
      // Process issues back to array
      const issuesArray = project.pissues 
        ? project.pissues.split(",").map(issue => issue.trim()).filter(issue => issue.length > 0)
        : [];

      await axios.put(`http://localhost:5050/projects/${id}`, {
        pname: project.pname,
        pnumber: project.pnumber,
        pcode: project.pcode,
        plocation: project.plocation,
        pimg: project.pimg,
        ptype: project.ptype,
        pownerid: project.pownerid,
        pownername: project.pownername,
        potelnumber: project.potelnumber,
        pdescription: project.pdescription,
        ppriority: project.ppriority,
        pbudget: Number(project.pbudget),
        pstatus: project.pstatus,
        penddate: project.penddate,
        pissues: issuesArray,
        pobservations: project.pobservations,
      });
      return true;
    } catch (err) {
      console.error("Error updating project:", err);
      throw err;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    
    try {
      await sendRequest();
      setMessage("✅ Project updated successfully!");
      
      // Navigate back after a short delay to show success message
      setTimeout(() => {
        navigate("/projects");
      }, 1500);
    } catch (err) {
      setMessage("❌ Failed to update project. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setProject(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div>
        <Nav />
        <div className="container mt-5">
          <div className="row justify-content-center">
            <div className="col-md-6 text-center">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <h5 className="text-muted">Loading project data...</h5>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Nav />
      <div className="container mt-4 mb-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            {/* Header Section */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-warning text-dark d-flex align-items-center justify-content-between">
                <div>
                  <h2 className="card-title mb-0">
                    <i className="fas fa-edit me-2"></i>
                    Update Project
                  </h2>
                  <small className="opacity-75">
                    Editing: {project.pname || "Project"}
                  </small>
                </div>
                <div className="d-flex gap-2">
                  <button 
                    type="button" 
                    className="btn btn-outline-dark btn-sm"
                    onClick={() => navigate("/projects")}
                  >
                    <i className="fas fa-arrow-left me-1"></i>
                    Back to Projects
                  </button>
                </div>
              </div>
              
              <div className="card-body">
                {/* Success/Error Message */}
                {message && (
                  <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`}>
                    {message}
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setMessage("")}
                      aria-label="Close"
                    ></button>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Basic Information Section */}
                  <div className="mb-4">
                    <h5 className="text-warning border-bottom pb-2 mb-3">
                      <i className="fas fa-info-circle me-2"></i>
                      Basic Information
                    </h5>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label htmlFor="pname" className="form-label fw-semibold">
                          Project Name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          id="pname"
                          name="pname"
                          className="form-control form-control-lg"
                          value={project.pname || ""}
                          onChange={(e) => handleChange('pname', e.target.value)}
                          placeholder="Enter project name"
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="pnumber" className="form-label fw-semibold">
                          Project Number <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          id="pnumber"
                          name="pnumber"
                          className="form-control form-control-lg"
                          value={project.pnumber || ""}
                          onChange={(e) => handleChange('pnumber', e.target.value)}
                          placeholder="Enter project number"
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="pcode" className="form-label fw-semibold">
                          Project Code <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          id="pcode"
                          name="pcode"
                          className="form-control form-control-lg"
                          value={project.pcode || ""}
                          onChange={(e) => handleChange('pcode', e.target.value)}
                          placeholder="Enter project code"
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="plocation" className="form-label fw-semibold">
                          Project Location <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          id="plocation"
                          name="plocation"
                          className="form-control form-control-lg"
                          value={project.plocation || ""}
                          onChange={(e) => handleChange('plocation', e.target.value)}
                          placeholder="Enter project location"
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label htmlFor="ptype" className="form-label fw-semibold">
                          Project Type <span className="text-danger">*</span>
                        </label>
                        <select
                          id="ptype"
                          name="ptype"
                          className="form-select form-select-lg"
                          value={project.ptype || ""}
                          onChange={(e) => handleChange('ptype', e.target.value)}
                          required
                        >
                          <option value="">Choose project type...</option>
                          <option value="Residential">🏠 Residential</option>
                          <option value="Commercial">🏢 Commercial</option>
                          <option value="Industrial">🏭 Industrial</option>
                          <option value="Infrastructure">🛣️ Infrastructure</option>
                          <option value="Institutional">🏫 Institutional</option>
                          <option value="Renovation">🔨 Renovation</option>
                          <option value="Landscaping">🌳 Landscaping</option>
                          <option value="Mixed-Use">🏙️ Mixed-Use</option>
                        </select>
                      </div>
                      
                      <div className="col-md-6">
                        <label htmlFor="pimg" className="form-label fw-semibold">
                          Project Images URL <span className="text-danger">*</span>
                        </label>
                        <input
                          type="url"
                          id="pimg"
                          name="pimg"
                          className="form-control form-control-lg"
                          value={project.pimg || ""}
                          onChange={(e) => handleChange('pimg', e.target.value)}
                          placeholder="Enter image URL"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Owner Information Section */}
                  <div className="mb-4">
                    <h5 className="text-warning border-bottom pb-2 mb-3">
                      <i className="fas fa-user me-2"></i>
                      Owner Information
                    </h5>
                    <div className="row g-3">
                      <div className="col-md-4">
                        <label htmlFor="pownerid" className="form-label fw-semibold">
                          Owner ID <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          id="pownerid"
                          name="pownerid"
                          className="form-control form-control-lg"
                          value={project.pownerid || ""}
                          onChange={(e) => handleChange('pownerid', e.target.value)}
                          placeholder="Enter owner ID"
                          required
                        />
                      </div>
                      <div className="col-md-4">
                        <label htmlFor="pownername" className="form-label fw-semibold">
                          Owner Name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          id="pownername"
                          name="pownername"
                          className="form-control form-control-lg"
                          value={project.pownername || ""}
                          onChange={(e) => handleChange('pownername', e.target.value)}
                          placeholder="Enter owner name"
                          required
                        />
                      </div>
                      <div className="col-md-4">
                        <label htmlFor="potelnumber" className="form-label fw-semibold">
                          Contact Number <span className="text-danger">*</span>
                        </label>
                        <input
                          type="tel"
                          id="potelnumber"
                          name="potelnumber"
                          className="form-control form-control-lg"
                          value={project.potelnumber || ""}
                          onChange={(e) => handleChange('potelnumber', e.target.value)}
                          placeholder="Enter contact number"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Project Details Section */}
                  <div className="mb-4">
                    <h5 className="text-warning border-bottom pb-2 mb-3">
                      <i className="fas fa-cog me-2"></i>
                      Project Details
                    </h5>
                    <div className="row g-3">
                      <div className="col-12">
                        <label htmlFor="pdescription" className="form-label fw-semibold">
                          Description <span className="text-danger">*</span>
                        </label>
                        <textarea
                          id="pdescription"
                          name="pdescription"
                          className="form-control"
                          rows="4"
                          value={project.pdescription || ""}
                          onChange={(e) => handleChange('pdescription', e.target.value)}
                          placeholder="Enter project description..."
                          required
                        />
                      </div>
                      <div className="col-md-4">
                        <label htmlFor="ppriority" className="form-label fw-semibold">
                          Priority <span className="text-danger">*</span>
                        </label>
                        <select
                          id="ppriority"
                          name="ppriority"
                          className="form-select form-select-lg"
                          value={project.ppriority || "Medium"}
                          onChange={(e) => handleChange('ppriority', e.target.value)}
                          required
                        >
                          <option value="High">🔴 High</option>
                          <option value="Medium">🟡 Medium</option>
                          <option value="Low">🟢 Low</option>
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label htmlFor="pbudget" className="form-label fw-semibold">
                          Budget <span className="text-danger">*</span>
                        </label>
                        <div className="input-group input-group-lg">
                          <span className="input-group-text">$</span>
                          <input
                            type="number"
                            id="pbudget"
                            name="pbudget"
                            className="form-control"
                            value={project.pbudget || ""}
                            onChange={(e) => handleChange('pbudget', e.target.value)}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <label htmlFor="pstatus" className="form-label fw-semibold">
                          Status <span className="text-danger">*</span>
                        </label>
                        <select
                          id="pstatus"
                          name="pstatus"
                          className="form-select form-select-lg"
                          value={project.pstatus || ""}
                          onChange={(e) => handleChange('pstatus', e.target.value)}
                          required
                        >
                          <option value="">Choose status...</option>
                          <option value="Planned">📋 Planned</option>
                          <option value="In Progress">⚡ In Progress</option>
                          <option value="Completed">✅ Completed</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="penddate" className="form-label fw-semibold">
                          End Date <span className="text-danger">*</span>
                        </label>
                        <input
                          type="date"
                          id="penddate"
                          name="penddate"
                          className="form-control form-control-lg"
                          value={
                            project.penddate
                              ? new Date(project.penddate).toISOString().split("T")[0]
                              : ""
                          }
                          onChange={(e) => handleChange('penddate', e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="pissues" className="form-label fw-semibold">
                          Issues
                        </label>
                        <input
                          type="text"
                          id="pissues"
                          name="pissues"
                          className="form-control form-control-lg"
                          value={project.pissues || ""}
                          onChange={(e) => handleChange('pissues', e.target.value)}
                          placeholder="Enter issues separated by commas"
                        />
                        <div className="form-text">
                          Separate multiple issues with commas
                        </div>
                      </div>
                      <div className="col-12">
                        <label htmlFor="pobservations" className="form-label fw-semibold">
                          Observations
                        </label>
                        <textarea
                          id="pobservations"
                          name="pobservations"
                          className="form-control"
                          rows="3"
                          value={project.pobservations || ""}
                          onChange={(e) => handleChange('pobservations', e.target.value)}
                          placeholder="Enter any observations or notes..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                    <button 
                      type="button"
                      className="btn btn-outline-secondary btn-lg px-4 py-2 me-md-2"
                      onClick={() => navigate("/projects")}
                      disabled={submitting}
                    >
                      <i className="fas fa-times me-2"></i>
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-warning btn-lg px-4 py-2"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Updating Project...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-2"></i>
                          Update Project
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpdateProjects;