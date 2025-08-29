import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Nav from "../Nav/Nav";

export default function UpdateProjectTimeline() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Debug logging
  useEffect(() => {
    console.log('📍 UpdateProjectTimeline component mounted');
    console.log('🔍 Timeline ID:', id);
    console.log('🔍 Current URL:', window.location.href);
  }, [id]);

  const [loading, setLoading] = useState(true);
  const [projectCode, setProjectCode] = useState("");
  const [projectDetails, setProjectDetails] = useState(null);
  const [validatingProject, setValidatingProject] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  const [form, setForm] = useState({
    date: "",
    tworker: [],
    tengineer: [],
    tarchitect: [],
    tprojectManager: [],
    texpenses: [],
    tmaterials: [],
    ttools: [],
    tnotes: ""
  });

  // Dropdown options
  const workerRoles = [
    "General Laborer", "Carpenter", "Mason/Bricklayer", "Electrician", "Plumber",
    "Painter", "Crane Operator", "Heavy Equipment Operator", "Welder", "Roofer",
    "Framer", "HVAC Technician", "Safety Inspector", "Site Supervisor", "Traffic Controller",
    "Concrete Worker", "Glazier", "Power Line Technician", "Maintenance Worker", "Landscaper"
  ];

  const engineerSpecialties = [
    "Structural Engineering", "Civil Engineering", "Electrical Engineering", "Mechanical Engineering",
    "Environmental Engineering", "Transportation Engineering", "Geotechnical Engineering", "Industrial Engineering",
    "Fire Protection Engineering", "Construction Technology", "Project Engineering", "Systems Engineering",
    "HVAC Engineering", "Lighting Design", "Acoustical Engineering", "Forensic Engineering"
  ];

  const architectSpecialties = [
    "Commercial Architecture", "Residential Architecture", "Industrial Architecture", "Landscape Architecture",
    "Historic Preservation", "Universal Design", "Sustainable Design", "Healthcare Architecture",
    "Educational Architecture", "Hospitality Architecture", "Retail Architecture", "Cultural Architecture",
    "High-rise Design", "Modern/Contemporary", "CAD/BIM Specialist", "Interior Architecture"
  ];

  const materialNames = [
    "Concrete Blocks", "Lumber/Wood", "Steel Beams", "Bricks", "Cement", "Gravel/Aggregate",
    "Rebar", "Glass Panels", "Insulation", "Roofing Materials", "Doors", "Windows",
    "Electrical Wire", "PVC Pipes", "Plumbing Fixtures", "Paint", "Nails/Screws", "Drywall",
    "Scaffolding", "Safety Barriers", "Lighting Fixtures", "Electrical Panels", "HVAC Components",
    "Flooring Materials", "Mortar", "Hardware/Fasteners"
  ];

  const toolNames = [
    "Hammer", "Circular Saw", "Wrench Set", "Screwdriver Set", "Measuring Tape", "Level",
    "Power Drill", "Angle Grinder", "Excavator", "Dump Truck", "Crane", "Bulldozer",
    "Welding Machine", "Plasma Cutter", "Ladder", "Scaffolding System", "Air Compressor",
    "Jackhammer", "Concrete Mixer", "Surveying Equipment", "Safety Harness", "Hard Hat",
    "Safety Glasses", "Work Gloves", "Steel Toe Boots", "Traffic Cones", "Clipboard/Tablet",
    "Construction Apps", "Inspection Tools", "Generator"
  ];

  // Fetch existing timeline data
  useEffect(() => {
    fetchTimelineData();
  }, [id]);

  const fetchTimelineData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching timeline data for ID:', id);
      
      const response = await axios.get(`http://localhost:5050/project-timelines/${id}`);
      const timeline = response.data;
      
      console.log('📥 Timeline data received:', timeline);
      
      // Populate form with existing data
      setForm({
        date: timeline.date ? timeline.date.split('T')[0] : "",
        tworker: timeline.tworker || [],
        tengineer: timeline.tengineer || [],
        tarchitect: timeline.tarchitect || [],
        tprojectManager: timeline.tprojectManager || [],
        texpenses: timeline.texpenses || [],
        tmaterials: timeline.tmaterials || [],
        ttools: timeline.ttools || [],
        tnotes: timeline.tnotes || ""
      });
      
      // Set project code and details
      if (timeline.pcode) {
        setProjectCode(timeline.pcode);
        // Auto-validate the project code to get project details
        validateProject(timeline.pcode);
      } else if (timeline.projectCode) {
        setProjectCode(timeline.projectCode);
        // Auto-validate the project code to get project details
        validateProject(timeline.projectCode);
      }
      
      // If project details are already included in timeline data
      if (timeline.projectDetails) {
        setProjectDetails(timeline.projectDetails);
      }
      
      setLoading(false);
      console.log('✅ Timeline data loaded successfully');
      
    } catch (error) {
      console.error('❌ Error fetching timeline:', error);
      setLoading(false);
      alert('Error loading timeline data. Please try again.');
    }
  };

  // Project validation function (used only for auto-validation during data load)
  const validateProject = async (code) => {
    if (!code.trim()) {
      setProjectDetails(null);
      return;
    }

    setValidatingProject(true);

    try {
      console.log('🔍 Auto-validating project code:', code);
      const response = await axios.get(
        `http://localhost:5050/project-timelines/validate-project/${code}`
      );
      
      if (response.data.valid) {
        setProjectDetails(response.data.projectDetails);
        console.log('✅ Project validation successful');
      }
    } catch (error) {
      console.error('❌ Validation error:', error.response?.data || error.message);
      // Don't set error state for auto-validation, just log it
    }
    setValidatingProject(false);
  };

  const addField = (key, newObj) => {
    setForm({ ...form, [key]: [...form[key], newObj] });
  };

  const updateField = (key, index, field, value) => {
    const updated = [...form[key]];
    updated[index][field] = value;
    setForm({ ...form, [key]: updated });
  };

  const removeField = (key, index) => {
    const updated = [...form[key]];
    updated.splice(index, 1);
    setForm({ ...form, [key]: updated });
  };

  // Handle form submission for update
  const handleSubmit = async (e) => {
    e.preventDefault();

    // No need to validate project code as it's auto-loaded and read-only
    if (!projectCode.trim()) {
      alert("Project code is missing. Please reload the page and try again.");
      return;
    }

    try {
      setUpdateLoading(true);
      
      const timelineData = {
        ...form,
        projectCode: projectCode, // Use the auto-loaded project code
        workerCount: form.tworker.length,
        tengineerCount: form.tengineer.length,
        architectCount: form.tarchitect.length
      };

      console.log('📤 Updating timeline with data:', timelineData);

      const response = await axios.put(`http://localhost:5050/project-timelines/${id}`, timelineData);
      console.log('✅ Timeline update response:', response.data);
      
      alert("✅ Project timeline updated successfully!");
      navigate("/project-timelines");
      
    } catch (error) {
      console.error("❌ Error updating timeline:", error.response?.data || error.message);
      
      if (error.response?.data?.message) {
        alert(`❌ Error updating project timeline: ${error.response.data.message}`);
      } else {
        alert(`❌ Error updating project timeline: ${error.message}`);
      }
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Nav />
        <div className="container mt-5">
          <div className="row justify-content-center">
            <div className="col-md-6 text-center">
              <div className="card shadow-lg border-0">
                <div className="card-body p-5">
                  <div className="spinner-border text-primary mb-3" role="status" style={{width: '3rem', height: '3rem'}}>
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <h4 className="text-muted">Loading Timeline Data...</h4>
                  <p className="text-secondary">Please wait while we fetch the timeline information.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Nav />
      
      {/* Modern Header Section */}
      <div className="bg-gradient" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '2rem 0',
        marginBottom: '2rem'
      }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <h1 className="display-6 fw-bold mb-2">
                <span className="me-3">📝</span>
                Update Project Timeline
              </h1>
              <p className="lead mb-0 opacity-90">
                Modify timeline entry for enhanced project tracking and resource management
              </p>
            </div>
            <div className="col-lg-4 text-end">
              <button 
                className="btn btn-light btn-lg shadow-sm me-2"
                onClick={() => navigate('/project-timelines')}
                style={{borderRadius: '50px', padding: '12px 30px'}}
              >
                <span className="me-2">⬅️</span> Back to Timeline
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-11">
            <div className="card shadow-lg border-0" style={{borderRadius: '20px'}}>
              <div className="card-header border-0" style={{
                background: 'linear-gradient(45deg, #28a745, #20c997)',
                borderRadius: '20px 20px 0 0',
                padding: '1.5rem'
              }}>
                <div className="d-flex align-items-center text-white">
                  <div className="bg-white bg-opacity-20 rounded-circle p-3 me-3">
                    <span style={{fontSize: '1.5rem'}}>✏️</span>
                  </div>
                  <div>
                    <h3 className="mb-1 fw-bold">Update Timeline Entry</h3>
                    <p className="mb-0 opacity-90">Timeline ID: {id}</p>
                  </div>
                </div>
              </div>
              
              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  {/* Project Code Section */}
                  <div className="mb-4">
                    <div className="card border-0 shadow-sm">
                      <div className="card-header bg-light border-0" style={{borderRadius: '12px 12px 0 0'}}>
                        <h5 className="mb-0 d-flex align-items-center">
                          <span className="me-2">🏢</span>
                          Project Information
                        </h5>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-6">
                            <label className="form-label fw-bold">Project Code *</label>
                            <div className="input-group">
                              <span className="input-group-text border-0 bg-success text-white">
                                <i className="fas fa-lock"></i>
                              </span>
                              <input
                                type="text"
                                className="form-control border-0 shadow-sm bg-light"
                                value={projectCode}
                                readOnly
                                disabled
                                style={{
                                  borderRadius: '0 12px 12px 0',
                                  backgroundColor: '#f8f9fa',
                                  cursor: 'not-allowed'
                                }}
                              />
                              <span className="input-group-text border-0 bg-success text-white">
                                <i className="fas fa-check"></i>
                              </span>
                            </div>
                            <small className="form-text text-muted mt-1">
                              <i className="fas fa-info-circle me-1"></i>
                              Project code is automatically loaded and cannot be changed during update
                            </small>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label fw-bold">Timeline ID</label>
                            <div className="input-group">
                              <span className="input-group-text border-0 bg-info text-white">
                                <i className="fas fa-fingerprint"></i>
                              </span>
                              <input
                                type="text"
                                className="form-control border-0 shadow-sm bg-light"
                                value={id}
                                readOnly
                                disabled
                                style={{
                                  borderRadius: '0 12px 12px 0',
                                  backgroundColor: '#f8f9fa',
                                  cursor: 'not-allowed'
                                }}
                              />
                            </div>
                            <small className="form-text text-muted mt-1">
                              <i className="fas fa-database me-1"></i>
                              Unique timeline identifier
                            </small>
                          </div>
                        </div>

                        {/* Project Details Display */}
                        {projectDetails && (
                          <div className="mt-4 p-4 rounded" style={{
                            background: 'linear-gradient(135deg, #e8f5e8 0%, #f0f9ff 100%)',
                            border: '2px solid #28a745',
                            borderRadius: '16px'
                          }}>
                            <h6 className="text-success mb-3 d-flex align-items-center">
                              <span className="me-2">✅</span>
                              <span className="me-2">🔗</span>
                              Linked Project Information
                            </h6>
                            <div className="row g-3">
                              <div className="col-md-6">
                                <div className="p-3 bg-white rounded-3 shadow-sm">
                                  <div className="d-flex align-items-center mb-2">
                                    <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                                      <i className="fas fa-building text-primary"></i>
                                    </div>
                                    <div>
                                      <strong className="text-primary">Project Name:</strong>
                                      <div className="fw-bold text-dark">{projectDetails.pname || 'N/A'}</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="p-3 bg-white rounded-3 shadow-sm">
                                  <div className="d-flex align-items-center mb-2">
                                    <div className="bg-info bg-opacity-10 rounded-circle p-2 me-3">
                                      <i className="fas fa-hashtag text-info"></i>
                                    </div>
                                    <div>
                                      <strong className="text-primary">Project Number:</strong>
                                      <div className="fw-bold text-dark">{projectDetails.pnumber || 'N/A'}</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="p-3 bg-white rounded-3 shadow-sm">
                                  <div className="d-flex align-items-center mb-2">
                                    <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3">
                                      <i className="fas fa-tasks text-success"></i>
                                    </div>
                                    <div>
                                      <strong className="text-primary">Status:</strong>
                                      <span className="badge bg-success ms-2 fs-6">
                                        {projectDetails.pstatus || 'N/A'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="p-3 bg-white rounded-3 shadow-sm">
                                  <div className="d-flex align-items-center mb-2">
                                    <div className="bg-warning bg-opacity-10 rounded-circle p-2 me-3">
                                      <i className="fas fa-map-marker-alt text-warning"></i>
                                    </div>
                                    <div>
                                      <strong className="text-primary">Location:</strong>
                                      <div className="fw-bold text-dark">{projectDetails.plocation || 'N/A'}</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {projectDetails.powner && (
                                <div className="col-md-6">
                                  <div className="p-3 bg-white rounded-3 shadow-sm">
                                    <div className="d-flex align-items-center mb-2">
                                      <div className="bg-secondary bg-opacity-10 rounded-circle p-2 me-3">
                                        <i className="fas fa-user-tie text-secondary"></i>
                                      </div>
                                      <div>
                                        <strong className="text-primary">Owner:</strong>
                                        <div className="fw-bold text-dark">{projectDetails.powner}</div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              {projectDetails.pcreatedAt && (
                                <div className="col-md-6">
                                  <div className="p-3 bg-white rounded-3 shadow-sm">
                                    <div className="d-flex align-items-center mb-2">
                                      <div className="bg-info bg-opacity-10 rounded-circle p-2 me-3">
                                        <i className="fas fa-calendar text-info"></i>
                                      </div>
                                      <div>
                                        <strong className="text-primary">Created:</strong>
                                        <div className="fw-bold text-dark">
                                          {new Date(projectDetails.pcreatedAt).toLocaleDateString()}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="mb-4">
                    <label className="form-label fw-bold d-flex align-items-center">
                      <span className="me-2">📅</span>
                      Timeline Date *
                    </label>
                    <input
                      type="date"
                      className="form-control border-0 shadow-sm"
                      style={{borderRadius: '12px', padding: '12px'}}
                      value={form.date}
                      onChange={(e) =>
                        setForm({ ...form, date: e.target.value })
                      }
                      required
                    />
                  </div>

                  {/* Workers Section */}
                  <div className="mb-4">
                    <div className="card border-0 shadow-sm">
                      <div className="card-header border-0" style={{
                        background: 'linear-gradient(45deg, #007bff, #0056b3)',
                        borderRadius: '12px 12px 0 0',
                        color: 'white'
                      }}>
                        <h5 className="mb-0 d-flex align-items-center">
                          <span className="me-2">👷</span>
                          Workers Management
                        </h5>
                      </div>
                      <div className="card-body">
                        {form.tworker.map((w, i) => (
                          <div key={i} className="row mb-3 p-3 border rounded" style={{backgroundColor: '#f8f9fa'}}>
                            <div className="col-md-4">
                              <label className="form-label small fw-bold">Worker Name</label>
                              <input
                                placeholder="Enter worker name"
                                className="form-control border-0 shadow-sm"
                                style={{borderRadius: '8px'}}
                                value={w.name || ""}
                                onChange={(e) =>
                                  updateField("tworker", i, "name", e.target.value)
                                }
                              />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label small fw-bold">Role</label>
                              <select
                                className="form-select border-0 shadow-sm"
                                style={{borderRadius: '8px'}}
                                value={w.role || ""}
                                onChange={(e) =>
                                  updateField("tworker", i, "role", e.target.value)
                                }
                              >
                                <option value="">Select Role</option>
                                {workerRoles.map((role, idx) => (
                                  <option key={idx} value={role}>
                                    {role}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="col-md-3">
                              <label className="form-label small fw-bold">Hours Worked</label>
                              <input
                                placeholder="Hours"
                                type="number"
                                className="form-control border-0 shadow-sm"
                                style={{borderRadius: '8px'}}
                                value={w.hoursWorked || ""}
                                onChange={(e) =>
                                  updateField(
                                    "tworker",
                                    i,
                                    "hoursWorked",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div className="col-md-1 d-flex align-items-end">
                              <button
                                type="button"
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => removeField("tworker", i)}
                                style={{borderRadius: '8px'}}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          style={{borderRadius: '25px', padding: '8px 20px'}}
                          onClick={() =>
                            addField("tworker", {
                              name: "",
                              role: "",
                              hoursWorked: 0
                            })
                          }
                        >
                          <i className="fas fa-plus me-2"></i>Add Worker
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Engineers Section */}
                  <div className="mb-4">
                    <div className="card border-0 shadow-sm">
                      <div className="card-header border-0" style={{
                        background: 'linear-gradient(45deg, #28a745, #20c997)',
                        borderRadius: '12px 12px 0 0',
                        color: 'white'
                      }}>
                        <h5 className="mb-0 d-flex align-items-center">
                          <span className="me-2">🔧</span>
                          Engineers Management
                        </h5>
                      </div>
                      <div className="card-body">
                        {form.tengineer.map((en, i) => (
                          <div key={i} className="row mb-3 p-3 border rounded" style={{backgroundColor: '#f8f9fa'}}>
                            <div className="col-md-4">
                              <label className="form-label small fw-bold">Engineer Name</label>
                              <input
                                className="form-control border-0 shadow-sm"
                                placeholder="Enter engineer name"
                                style={{borderRadius: '8px'}}
                                value={en.name || ""}
                                onChange={(e) =>
                                  updateField("tengineer", i, "name", e.target.value)
                                }
                              />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label small fw-bold">Specialty</label>
                              <select
                                className="form-select border-0 shadow-sm"
                                style={{borderRadius: '8px'}}
                                value={en.specialty || ""}
                                onChange={(e) =>
                                  updateField(
                                    "tengineer",
                                    i,
                                    "specialty",
                                    e.target.value
                                  )
                                }
                              >
                                <option value="">Select Specialty</option>
                                {engineerSpecialties.map((spec, idx) => (
                                  <option key={idx} value={spec}>
                                    {spec}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="col-md-3">
                              <label className="form-label small fw-bold">Hours Worked</label>
                              <input
                                placeholder="Hours"
                                type="number"
                                className="form-control border-0 shadow-sm"
                                style={{borderRadius: '8px'}}
                                value={en.hoursWorked || ""}
                                onChange={(e) =>
                                  updateField(
                                    "tengineer",
                                    i,
                                    "hoursWorked",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div className="col-md-1 d-flex align-items-end">
                              <button
                                type="button"
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => removeField("tengineer", i)}
                                style={{borderRadius: '8px'}}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="btn btn-outline-success"
                          style={{borderRadius: '25px', padding: '8px 20px'}}
                          onClick={() =>
                            addField("tengineer", { name: "", specialty: "", hoursWorked: 0 })
                          }
                        >
                          <i className="fas fa-plus me-2"></i>Add Engineer
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Architects Section */}
                  <div className="mb-4">
                    <div className="card border-0 shadow-sm">
                      <div className="card-header border-0" style={{
                        background: 'linear-gradient(45deg, #17a2b8, #138496)',
                        borderRadius: '12px 12px 0 0',
                        color: 'white'
                      }}>
                        <h5 className="mb-0 d-flex align-items-center">
                          <span className="me-2">🏗️</span>
                          Architects Management
                        </h5>
                      </div>
                      <div className="card-body">
                        {form.tarchitect.map((ar, i) => (
                          <div key={i} className="row mb-3 p-3 border rounded" style={{backgroundColor: '#f8f9fa'}}>
                            <div className="col-md-4">
                              <label className="form-label small fw-bold">Architect Name</label>
                              <input
                                className="form-control border-0 shadow-sm"
                                placeholder="Enter architect name"
                                style={{borderRadius: '8px'}}
                                value={ar.name || ""}
                                onChange={(e) =>
                                  updateField("tarchitect", i, "name", e.target.value)
                                }
                              />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label small fw-bold">Specialty</label>
                              <select
                                className="form-select border-0 shadow-sm"
                                style={{borderRadius: '8px'}}
                                value={ar.specialty || ""}
                                onChange={(e) =>
                                  updateField(
                                    "tarchitect",
                                    i,
                                    "specialty",
                                    e.target.value
                                  )
                                }
                              >
                                <option value="">Select Specialty</option>
                                {architectSpecialties.map((spec, idx) => (
                                  <option key={idx} value={spec}>
                                    {spec}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="col-md-3">
                              <label className="form-label small fw-bold">Hours Worked</label>
                              <input
                                placeholder="Hours"
                                type="number"
                                className="form-control border-0 shadow-sm"
                                style={{borderRadius: '8px'}}
                                value={ar.hoursWorked || ""}
                                onChange={(e) =>
                                  updateField(
                                    "tarchitect",
                                    i,
                                    "hoursWorked",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div className="col-md-1 d-flex align-items-end">
                              <button
                                type="button"
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => removeField("tarchitect", i)}
                                style={{borderRadius: '8px'}}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="btn btn-outline-info"
                          style={{borderRadius: '25px', padding: '8px 20px'}}
                          onClick={() =>
                            addField("tarchitect", { name: "", specialty: "", hoursWorked: 0 })
                          }
                        >
                          <i className="fas fa-plus me-2"></i>Add Architect
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Project Managers Section */}
                  <div className="mb-4">
                    <div className="card border-0 shadow-sm">
                      <div className="card-header border-0" style={{
                        background: 'linear-gradient(45deg, #6c757d, #495057)',
                        borderRadius: '12px 12px 0 0',
                        color: 'white'
                      }}>
                        <h5 className="mb-0 d-flex align-items-center">
                          <span className="me-2">👨‍💼</span>
                          Project Managers
                        </h5>
                      </div>
                      <div className="card-body">
                        {form.tprojectManager.map((pm, i) => (
                          <div key={i} className="row mb-3 p-3 border rounded" style={{backgroundColor: '#f8f9fa'}}>
                            <div className="col-md-5">
                              <label className="form-label small fw-bold">Manager Name</label>
                              <input
                                className="form-control border-0 shadow-sm"
                                placeholder="Enter manager name"
                                style={{borderRadius: '8px'}}
                                value={pm.name || ""}
                                onChange={(e) =>
                                  updateField("tprojectManager", i, "name", e.target.value)
                                }
                              />
                            </div>
                            <div className="col-md-5">
                              <label className="form-label small fw-bold">Contact Information</label>
                              <input
                                className="form-control border-0 shadow-sm"
                                placeholder="Phone, email, etc."
                                style={{borderRadius: '8px'}}
                                value={pm.contact || ""}
                                onChange={(e) =>
                                  updateField("tprojectManager", i, "contact", e.target.value)
                                }
                              />
                            </div>
                            <div className="col-md-2 d-flex align-items-end">
                              <button
                                type="button"
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => removeField("tprojectManager", i)}
                                style={{borderRadius: '8px'}}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          style={{borderRadius: '25px', padding: '8px 20px'}}
                          onClick={() =>
                            addField("tprojectManager", { name: "", contact: "" })
                          }
                        >
                          <i className="fas fa-plus me-2"></i>Add Project Manager
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Materials Section */}
                  <div className="mb-4">
                    <div className="card border-0 shadow-sm">
                      <div className="card-header border-0" style={{
                        background: 'linear-gradient(45deg, #ffc107, #e0a800)',
                        borderRadius: '12px 12px 0 0',
                        color: 'white'
                      }}>
                        <h5 className="mb-0 d-flex align-items-center">
                          <span className="me-2">🧾</span>
                          Materials Management
                        </h5>
                      </div>
                      <div className="card-body">
                        {form.tmaterials.map((mat, i) => (
                          <div key={i} className="row mb-3 p-3 border rounded" style={{backgroundColor: '#fff3cd'}}>
                            <div className="col-md-3">
                              <label className="form-label small fw-bold">Material</label>
                              <select
                                className="form-select border-0 shadow-sm"
                                style={{borderRadius: '8px'}}
                                value={mat.name || ""}
                                onChange={(e) =>
                                  updateField("tmaterials", i, "name", e.target.value)
                                }
                              >
                                <option value="">Select Material</option>
                                {materialNames.map((m, idx) => (
                                  <option key={idx} value={m}>
                                    {m}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="col-md-2">
                              <label className="form-label small fw-bold">Quantity</label>
                              <input
                                className="form-control border-0 shadow-sm"
                                type="number"
                                placeholder="Qty"
                                style={{borderRadius: '8px'}}
                                value={mat.quantity || ""}
                                onChange={(e) =>
                                  updateField("tmaterials", i, "quantity", e.target.value)
                                }
                              />
                            </div>
                            <div className="col-md-2">
                              <label className="form-label small fw-bold">Unit</label>
                              <input
                                className="form-control border-0 shadow-sm"
                                placeholder="kg, m, etc."
                                style={{borderRadius: '8px'}}
                                value={mat.unit || ""}
                                onChange={(e) =>
                                  updateField("tmaterials", i, "unit", e.target.value)
                                }
                              />
                            </div>
                            <div className="col-md-3">
                              <label className="form-label small fw-bold">Cost ($)</label>
                              <input
                                className="form-control border-0 shadow-sm"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                style={{borderRadius: '8px'}}
                                value={mat.cost || ""}
                                onChange={(e) =>
                                  updateField("tmaterials", i, "cost", e.target.value)
                                }
                              />
                            </div>
                            <div className="col-md-2 d-flex align-items-end">
                              <button
                                type="button"
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => removeField("tmaterials", i)}
                                style={{borderRadius: '8px'}}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="btn btn-outline-warning"
                          style={{borderRadius: '25px', padding: '8px 20px'}}
                          onClick={() =>
                            addField("tmaterials", { name: "", quantity: 0, unit: "", cost: 0 })
                          }
                        >
                          <i className="fas fa-plus me-2"></i>Add Material
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Tools Section */}
                  <div className="mb-4">
                    <div className="card border-0 shadow-sm">
                      <div className="card-header border-0" style={{
                        background: 'linear-gradient(45deg, #343a40, #212529)',
                        borderRadius: '12px 12px 0 0',
                        color: 'white'
                      }}>
                        <h5 className="mb-0 d-flex align-items-center">
                          <span className="me-2">🔨</span>
                          Tools & Equipment
                        </h5>
                      </div>
                      <div className="card-body">
                        {form.ttools.map((tool, i) => (
                          <div key={i} className="row mb-3 p-3 border rounded" style={{backgroundColor: '#f8f9fa'}}>
                            <div className="col-md-4">
                              <label className="form-label small fw-bold">Tool/Equipment</label>
                              <select
                                className="form-select border-0 shadow-sm"
                                style={{borderRadius: '8px'}}
                                value={tool.name || ""}
                                onChange={(e) =>
                                  updateField("ttools", i, "name", e.target.value)
                                }
                              >
                                <option value="">Select Tool</option>
                                {toolNames.map((t, idx) => (
                                  <option key={idx} value={t}>
                                    {t}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="col-md-3">
                              <label className="form-label small fw-bold">Quantity</label>
                              <input
                                className="form-control border-0 shadow-sm"
                                type="number"
                                placeholder="Quantity"
                                style={{borderRadius: '8px'}}
                                value={tool.quantity || ""}
                                onChange={(e) =>
                                  updateField("ttools", i, "quantity", e.target.value)
                                }
                              />
                            </div>
                            <div className="col-md-3">
                              <label className="form-label small fw-bold">Status</label>
                              <select
                                className="form-select border-0 shadow-sm"
                                style={{borderRadius: '8px'}}
                                value={tool.status || ""}
                                onChange={(e) =>
                                  updateField("ttools", i, "status", e.target.value)
                                }
                              >
                                <option value="">Select Status</option>
                                <option value="Available">Available</option>
                                <option value="In Use">In Use</option>
                                <option value="Maintenance">Maintenance</option>
                                <option value="Damaged">Damaged</option>
                              </select>
                            </div>
                            <div className="col-md-2 d-flex align-items-end">
                              <button
                                type="button"
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => removeField("ttools", i)}
                                style={{borderRadius: '8px'}}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="btn btn-outline-dark"
                          style={{borderRadius: '25px', padding: '8px 20px'}}
                          onClick={() =>
                            addField("ttools", { name: "", quantity: 0, status: "" })
                          }
                        >
                          <i className="fas fa-plus me-2"></i>Add Tool
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expenses Section */}
                  <div className="mb-4">
                    <div className="card border-0 shadow-sm">
                      <div className="card-header border-0" style={{
                        background: 'linear-gradient(45deg, #dc3545, #c82333)',
                        borderRadius: '12px 12px 0 0',
                        color: 'white'
                      }}>
                        <h5 className="mb-0 d-flex align-items-center">
                          <span className="me-2">💰</span>
                          Expenses Tracking
                        </h5>
                      </div>
                      <div className="card-body">
                        {form.texpenses.map((ex, i) => (
                          <div key={i} className="row mb-3 p-3 border rounded" style={{backgroundColor: '#f8d7da'}}>
                            <div className="col-md-5">
                              <label className="form-label small fw-bold">Expense Description</label>
                              <input
                                className="form-control border-0 shadow-sm"
                                placeholder="Enter expense description"
                                style={{borderRadius: '8px'}}
                                value={ex.description || ""}
                                onChange={(e) =>
                                  updateField("texpenses", i, "description", e.target.value)
                                }
                              />
                            </div>
                            <div className="col-md-3">
                              <label className="form-label small fw-bold">Amount ($)</label>
                              <input
                                className="form-control border-0 shadow-sm"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                style={{borderRadius: '8px'}}
                                value={ex.amount || ""}
                                onChange={(e) =>
                                  updateField("texpenses", i, "amount", e.target.value)
                                }
                              />
                            </div>
                            <div className="col-md-2">
                              <label className="form-label small fw-bold">Date</label>
                              <input
                                className="form-control border-0 shadow-sm"
                                type="date"
                                style={{borderRadius: '8px'}}
                                value={ex.date || ""}
                                onChange={(e) =>
                                  updateField("texpenses", i, "date", e.target.value)
                                }
                              />
                            </div>
                            <div className="col-md-2 d-flex align-items-end">
                              <button
                                type="button"
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => removeField("texpenses", i)}
                                style={{borderRadius: '8px'}}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          style={{borderRadius: '25px', padding: '8px 20px'}}
                          onClick={() =>
                            addField("texpenses", { description: "", amount: 0, date: "" })
                          }
                        >
                          <i className="fas fa-plus me-2"></i>Add Expense
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Notes Section */}
                  <div className="mb-4">
                    <label className="form-label fw-bold d-flex align-items-center">
                      <span className="me-2">📝</span>
                      Timeline Notes & Observations
                    </label>
                    <textarea
                      className="form-control border-0 shadow-sm"
                      rows="4"
                      placeholder="Enter detailed notes, observations, issues, or additional information about this timeline entry..."
                      style={{borderRadius: '12px', padding: '15px'}}
                      value={form.tnotes}
                      onChange={(e) =>
                        setForm({ ...form, tnotes: e.target.value })
                      }
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="d-flex justify-content-between align-items-center mt-5">
                    <button 
                      type="button"
                      className="btn btn-outline-secondary btn-lg"
                      onClick={() => navigate('/project-timelines')}
                      style={{borderRadius: '50px', padding: '12px 30px'}}
                    >
                      <span className="me-2">←</span> Cancel & Return
                    </button>
                    
                    <button 
                      type="submit" 
                      className="btn btn-lg shadow-lg"
                      disabled={updateLoading}
                      style={{
                        borderRadius: '50px', 
                        padding: '12px 40px',
                        background: 'linear-gradient(45deg, #28a745, #20c997)',
                        border: 'none',
                        color: 'white'
                      }}
                    >
                      {updateLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Updating Timeline...
                        </>
                      ) : (
                        <>
                          <span className="me-2">✅</span> Update Timeline Entry
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
    </>
  );
}