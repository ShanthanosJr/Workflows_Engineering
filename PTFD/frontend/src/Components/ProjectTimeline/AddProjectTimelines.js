import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Nav from "../Nav/Nav";
import { 
  BsBuilding, 
  BsCalendarEvent, 
  BsPeople, 
  BsPersonCheck, 
  BsHddStack, 
  BsTools, 
  BsCurrencyDollar, 
  BsFileText,
  BsSave,
  BsPlusCircle,
  BsDashCircle,
  BsCheckCircle,
  BsExclamationCircle
} from "react-icons/bs";

export default function AddProjectTimeline() {
  const navigate = useNavigate();
  
  // Debug logging
  useEffect(() => {
    console.log('📍 AddProjectTimeline component mounted successfully!');
    console.log('🔍 Current URL:', window.location.href);
  }, []);

  const [projectCode, setProjectCode] = useState("");
  const [projectDetails, setProjectDetails] = useState(null);
  const [validatingProject, setValidatingProject] = useState(false);
  const [projectError, setProjectError] = useState("");

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

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [formProgress, setFormProgress] = useState(0); // Premium: Form completion progress

  // Dropdown options (unchanged)
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

  // FIXED: Updated validate project function (unchanged logic)
  const validateProject = async (code) => {
    if (!code.trim()) {
      setProjectDetails(null);
      setProjectError("");
      return;
    }

    setValidatingProject(true);
    setProjectError("");

    try {
      console.log('Validating project code:', code);
      const response = await axios.get(
        `http://localhost:5050/project-timelines/validate-project/${code}`
      );
      console.log('Validation response:', response.data);
      
      if (response.data.valid) {
        setProjectDetails(response.data.projectDetails);
        setProjectError("");
        console.log('Project validation successful:', response.data.projectDetails);
      }
    } catch (error) {
      console.error('Validation error:', error.response?.data || error.message);
      setProjectDetails(null);
      if (error.response?.status === 404) {
        setProjectError("Project not found. Please verify the Project Code exists in the projects database.");
      } else if (error.response?.data?.message) {
        setProjectError(error.response.data.message);
      } else {
        setProjectError(`Error validating project: ${error.message}`);
      }
    }
    setValidatingProject(false);
  };

  const handleProjectCodeChange = (e) => {
    const code = e.target.value;
    setProjectCode(code);

    // Debounce validation
    clearTimeout(window.projectValidationTimeout);
    window.projectValidationTimeout = setTimeout(() => {
      validateProject(code);
    }, 500);
  };

  const addField = (key, newObj) => {
    setForm(prev => ({ ...prev, [key]: [...prev[key], newObj] }));
  };

  const updateField = (key, index, field, value) => {
    setForm(prev => {
      const updated = [...prev[key]];
      updated[index][field] = value;
      return { ...prev, [key]: updated };
    });
  };

  const removeField = (key, index) => {
    setForm(prev => {
      const updated = [...prev[key]];
      updated.splice(index, 1);
      return { ...prev, [key]: updated };
    });
  };

  // Premium: Calculate form progress
  useEffect(() => {
    const totalFields = 1 + form.tworker.length + form.tengineer.length + form.tarchitect.length + 
                        form.tprojectManager.length + form.texpenses.length + form.tmaterials.length + 
                        form.ttools.length + (form.tnotes ? 1 : 0);
    const filledFields = (form.date ? 1 : 0) + form.tworker.filter(w => w.name && w.role).length + 
                        form.tengineer.filter(e => e.name && e.specialty).length + 
                        form.tarchitect.filter(a => a.name && a.specialty).length + 
                        form.tprojectManager.filter(pm => pm.name).length + 
                        form.texpenses.filter(ex => ex.description && ex.amount).length + 
                        form.tmaterials.filter(m => m.name && m.quantity).length + 
                        form.ttools.filter(t => t.name && t.status).length + 
                        (form.tnotes ? 1 : 0);
    setFormProgress(Math.round((filledFields / Math.max(totalFields, 1)) * 100));
  }, [form]);

  // Premium: Auto-save draft to localStorage
  useEffect(() => {
    localStorage.setItem('timelineDraft', JSON.stringify({ ...form, projectCode, projectDetails }));
  }, [form, projectCode, projectDetails]);

  // Premium: Load draft on mount - FIXED: Use functional update to avoid ESLint warning
  useEffect(() => {
    const draft = localStorage.getItem('timelineDraft');
    if (draft) {
      const parsed = JSON.parse(draft);
      setForm(prev => parsed.form || prev);
      setProjectCode(parsed.projectCode || "");
      setProjectDetails(parsed.projectDetails || null);
    }
  }, []); // Empty array, functional update avoids dependency on 'form'

  // FIXED: Updated handleSubmit function (enhanced with loading and message)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!projectCode.trim()) {
      setMessage("❌ Please enter a valid Project Code.");
      setLoading(false);
      return;
    }

    if (!projectDetails) {
      setMessage("Please wait for project validation or enter a valid Project Code.");
      setLoading(false);
      return;
    }

    try {
      const timelineData = {
        ...form,
        projectCode: projectCode,
        workerCount: form.tworker.length,
        tengineerCount: form.tengineer.length,
        architectCount: form.tarchitect.length
      };

      console.log('Sending timeline data:', timelineData);

      const response = await axios.post("http://localhost:5050/project-timelines", timelineData);
      console.log('Timeline creation response:', response.data);
      
      setMessage("✅ Project timeline created successfully!");
      localStorage.removeItem('timelineDraft'); // Clear draft on success
      navigate("/project-timelines");
    } catch (error) {
      console.error("Error creating timeline:", error.response?.data || error.message);
      
      if (error.response?.data?.message) {
        setMessage(`❌ Error creating project timeline: ${error.response.data.message}`);
      } else {
        setMessage(`❌ Error creating project timeline: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Premium: Clear draft
  const clearDraft = () => {
    if (window.confirm('Clear unsaved draft?')) {
      localStorage.removeItem('timelineDraft');
      setForm({
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
      setProjectCode("");
      setProjectDetails(null);
    }
  };

  return (
    <div style={{ backgroundColor: '#fdfcfb', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <Nav />

      {/* Premium Dashboard-Style Header */}
      <section className="container-fluid px-4 py-5" style={{
        background: 'linear-gradient(135deg, #fdfcfb 0%, #f8f7f4 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(212, 175, 55, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(212, 175, 55, 0.03) 0%, transparent 50%)',
          pointerEvents: 'none'
        }}></div>

        <div className="row justify-content-center position-relative">
          <div className="col-lg-10">
            <div className="text-center mb-5" style={{
              borderRadius: '24px',
              padding: '4rem 3rem',
              background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(253, 252, 251, 0.8) 100%)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div className="d-flex align-items-center justify-content-center mb-4">
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 25px rgba(212, 175, 55, 0.3)',
                  marginRight: '1rem'
                }}>
                  <BsCalendarEvent className="text-white fs-1" />
                </div>
                <div>
                  <h1 className="display-3 fw-bold mb-1" style={{
                    color: '#1a1a1a',
                    fontWeight: '700',
                    letterSpacing: '-0.02em'
                  }}>Timeline Chronicle</h1>
                  <p className="h5 text-muted mb-0" style={{ fontWeight: '300' }}>
                    Chronicle daily milestones with sophisticated precision
                  </p>
                </div>
              </div>
              <p className="lead mb-4" style={{
                color: '#6b7280',
                fontSize: '1.25rem',
                lineHeight: '1.6',
                maxWidth: '600px',
                margin: '0 auto'
              }}>
                Meticulously document progress, allocate resources, and maintain impeccable safety records across your construction ecosystem.
              </p>
              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <button onClick={() => navigate("/projects-fd")} className="btn btn-outline-primary btn-lg px-5 py-3 fw-semibold" style={{
                  borderRadius: '50px',
                  border: '2px solid #d4af37',
                  color: '#d4af37',
                  fontWeight: '600',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(212, 175, 55, 0.2)'
                }}>
                  <BsBuilding className="me-2" />View Projects
                </button>
                <button onClick={() => navigate("/project-timelines")} className="btn btn-primary btn-lg px-5 py-3 fw-semibold" style={{
                  borderRadius: '50px',
                  background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                  border: 'none',
                  color: '#fff',
                  fontWeight: '600',
                  boxShadow: '0 4px 20px rgba(212, 175, 55, 0.4)',
                  transition: 'all 0.3s ease'
                }}>
                  <BsCalendarEvent className="me-2" />Timelines
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mt-5 mb-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            {/* Enhanced Form Card */}
            <div className="card border-0 shadow-xl" style={{
              borderRadius: '24px',
              overflow: 'hidden',
              background: 'linear-gradient(145deg, #ffffff 0%, #fdfcfb 100%)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 25px 80px rgba(0, 0, 0, 0.1), 0 1px 4px rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div className="card-header bg-transparent border-0 py-5 px-5">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <div className="bg-gradient p-3 rounded-3 me-4" style={{
                      background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                      width: '60px',
                      height: '60px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 8px 25px rgba(212, 175, 55, 0.3)'
                    }}>
                      <BsCalendarEvent className="text-black fs-5" />
                    </div>
                  <div className="w-100 text-center">
                      <h2 className="h3 fw-bold mb-1" style={{ color: "#111827" }}>
                        Daily Chronicle Blueprint
                      </h2>
                      <p className="text-muted mb-0" style={{ fontSize: "0.95rem" }}>
                        Architect your timeline with granular precision and foresight
                      </p>
                    </div>
                  </div>
                  {/* Premium: Form Progress */}
                  <div className="text-end">
                    <div className="mb-2">
                      <small className="text-muted">Chronicle Completion</small>
                    </div>
                    <div className="progress rounded-pill" style={{ height: '8px', backgroundColor: '#f3f4f6' }} role="progressbar" aria-valuenow={formProgress} aria-valuemin="0" aria-valuemax="100">
                      <div className="progress-bar bg-gradient rounded-pill" style={{ 
                        width: `${formProgress}%`, 
                        background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                        transition: 'width 0.3s ease'
                      }}></div>
                    </div>
                    <small className="text-muted mt-1">{formProgress}% Complete</small>
                  </div>
                </div>
                {/* Premium: Draft Actions */}
                {localStorage.getItem('timelineDraft') && (
                  <div className="d-flex justify-content-end mt-3">
                    <button onClick={clearDraft} className="btn btn-outline-secondary btn-sm me-2" style={{ borderRadius: '20px' }}>
                      <BsDashCircle className="me-1" /> Clear Draft
                    </button>
                    <span className="text-success small mt-1">
                      <BsCheckCircle className="me-1" /> Draft Auto-Saved
                    </span>
                  </div>
                )}
              </div>
              <div className="card-body p-0">
                <div className="p-5">
                  {/* Success/Error Message */}
                  {message && (
                    <div className={`alert ${message.includes('✅') ? 'alert-success border-0 shadow-sm bg-gradient' : 'alert-danger border-0 shadow-sm bg-gradient-danger'} fade show mb-5`} style={{
                      borderRadius: '16px',
                      background: message.includes('✅') ? 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' : 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
                      color: '#fff',
                      boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
                    }}>
                      <div className="d-flex align-items-center">
                        <BsCheckCircle className={`me-3 fs-4 ${message.includes('✅') ? '' : 'd-none'}`} />
                        <BsExclamationCircle className={`me-3 fs-4 ${message.includes('✅') ? 'd-none' : ''}`} />
                        <div className="flex-grow-1">{message}</div>
                      </div>
                      <button
                        type="button"
                        className="btn-close btn-close-white ms-auto"
                        onClick={() => setMessage("")}
                        aria-label="Close"
                      ></button>
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    {/* Project Selection Section - FIXED: Full width for consistency */}
                    <div className="mb-5">
                      <h5 className="fw-bold mb-4" style={{
                        color: '#d4af37',
                        borderBottom: '3px solid #f8f7f4',
                        paddingBottom: '1rem',
                        fontSize: '1.25rem'
                      }}>
                        <BsBuilding className="me-3 text-muted fs-5" /> Project Anchor
                      </h5>
                      <div className="row g-4 justify-content-center">
                        <div className="col-12 col-md-8">
                          <label className="form-label fw-semibold mb-2" style={{ color: '#374151' }}>
                            Project Code <span className="text-danger">*</span>
                          </label>
                          <div className="input-group">
                            <span className="input-group-text bg-transparent border-end-0 text-muted fs-6" style={{
                              backgroundColor: '#fdfcfb',
                              borderColor: '#e5e7eb',
                              borderRight: 'none !important'
                            }}>
                              <BsBuilding />
                            </span>
                            <input
                              type="text"
                              className={`form-control form-control-lg ${projectError ? 'is-invalid' : projectDetails ? 'is-valid' : ''}`}
                              style={{
                                borderRadius: '16px',
                                backgroundColor: '#fdfcfb',
                                padding: '1rem 1.25rem',
                                borderLeft: 'none',
                                boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)',
                                transition: 'all 0.2s ease',
                                fontSize: '1rem',
                                borderColor: projectError ? '#ef4444' : projectDetails ? '#10b981' : '#e5e7eb'
                              }}
                              placeholder="Enter Project Code (e.g., RES-TWR-A)"
                              value={projectCode}
                              onChange={handleProjectCodeChange}
                              required
                            />
                            {validatingProject && (
                              <span className="input-group-text bg-transparent" style={{
                                backgroundColor: '#fdfcfb',
                                borderColor: '#e5e7eb'
                              }}>
                                <div className="spinner-border spinner-border-sm text-warning" role="status" style={{ width: '1rem', height: '1rem' }}>
                                  <span className="visually-hidden">Validating...</span>
                                </div>
                              </span>
                            )}
                          </div>
                          {projectError && (
                            <div className="invalid-feedback d-block mt-1">
                              <BsExclamationCircle className="me-1" /> {projectError}
                            </div>
                          )}
                          <small className="form-text text-muted mt-1">
                            Intelligent validation auto-populates project intelligence.
                          </small>
                        </div>
                      </div>

                      {/* Enhanced Project Details - FIXED: Full width container */}
                      {projectDetails && (
                        <div className="row g-4 justify-content-center mt-4">
                          <div className="col-12">
                            <div className="p-4 rounded-3 border border-warning-subtle bg-warning-subtle bg-opacity-10">
                              <h6 className="text-warning mb-3 fw-bold d-flex align-items-center">
                                <BsCheckCircle className="me-2" /> Anchor Verified
                              </h6>
                              <div className="row g-3">
                                <div className="col-md-3">
                                  <small className="text-muted">Name</small>
                                  <p className="fw-semibold text-dark mb-0">{projectDetails.pname || 'N/A'}</p>
                                </div>
                                <div className="col-md-3">
                                  <small className="text-muted">Code</small>
                                  <p className="fw-semibold text-warning mb-0">{projectDetails.pcode || 'N/A'}</p>
                                </div>
                                <div className="col-md-2">
                                  <small className="text-muted">Number</small>
                                  <p className="fw-semibold mb-0">{projectDetails.pnumber || 'N/A'}</p>
                                </div>
                                <div className="col-md-2">
                                  <small className="text-muted">Owner</small>
                                  <p className="fw-semibold mb-0">{projectDetails.powner || 'N/A'}</p>
                                </div>
                                <div className="col-md-2">
                                  <small className="text-muted">Status</small>
                                  <span className="badge bg-warning text-dark fs-6">{projectDetails.pstatus || 'N/A'}</span>
                                </div>
                              </div>
                              <div className="row g-3 mt-2">
                                <div className="col-md-6">
                                  <small className="text-muted">Location</small>
                                  <p className="fw-semibold text-dark mb-0">{projectDetails.plocation || 'N/A'}</p>
                                </div>
                                {projectDetails.pcreatedAt && (
                                  <div className="col-md-6">
                                    <small className="text-muted">Initiated</small>
                                    <p className="fw-semibold mb-0">
                                      {new Date(projectDetails.pcreatedAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Date Section - FIXED: Full width */}
                    <div className="mb-5">
                      <h5 className="fw-bold mb-4" style={{
                        color: '#d4af37',
                        borderBottom: '3px solid #f8f7f4',
                        paddingBottom: '1rem',
                        fontSize: '1.25rem'
                      }}>
                        <BsCalendarEvent className="me-3 text-muted fs-5" /> Temporal Anchor <span className="text-danger">*</span>
                      </h5>
                      <div className="row g-4 justify-content-center">
                        <div className="col-12 col-md-6">
                          <label className="form-label fw-semibold mb-2" style={{ color: '#374151' }}>
                            Chronicle Date
                          </label>
                          <div className="input-group">
                            <span className="input-group-text bg-transparent border-end-0 text-muted fs-6" style={{
                              backgroundColor: '#fdfcfb',
                              borderColor: '#e5e7eb',
                              borderRight: 'none !important'
                            }}>
                              <BsCalendarEvent />
                            </span>
                            <input
                              type="date"
                              className="form-control form-control-lg"
                              style={{
                                borderRadius: '16px',
                                backgroundColor: '#fdfcfb',
                                padding: '1rem 1.25rem',
                                borderLeft: 'none',
                                boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)',
                                transition: 'all 0.2s ease',
                                fontSize: '1rem',
                                borderColor: '#e5e7eb'
                              }}
                              value={form.date}
                              onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Sections - Enhanced with consistent full-width rows for alignment */}
                    {/* Workers Section - FIXED: col-12 for all to prevent misalignment */}
                    <div className="mb-5">
                      <h5 className="fw-bold mb-4" style={{
                        color: '#d4af37',
                        borderBottom: '3px solid #f8f7f4',
                        paddingBottom: '1rem',
                        fontSize: '1.25rem'
                      }}>
                        <BsPeople className="me-3 text-muted fs-5" /> Workforce Deployment
                      </h5>
                      {form.tworker.map((w, i) => (
                        <div key={i} className="row mb-3">
                          <div className="col-12">
                            <div className="p-4 border rounded-3 bg-light" style={{ borderColor: '#f8f7f4' }}>
                              <div className="row g-3">
                                <div className="col-md-4">
                                  <label className="form-label small text-muted">Name</label>
                                  <input
                                    placeholder="Worker Name"
                                    className="form-control py-2"
                                    style={{
                                      borderRadius: '12px',
                                      backgroundColor: '#fdfcfb',
                                      border: '1px solid #e5e7eb',
                                      fontSize: '0.95rem'
                                    }}
                                    value={w.name || ""}
                                    onChange={(e) => updateField("tworker", i, "name", e.target.value)}
                                  />
                                </div>
                                <div className="col-md-4">
                                  <label className="form-label small text-muted">Role</label>
                                  <select
                                    className="form-select py-2"
                                    style={{
                                      borderRadius: '12px',
                                      backgroundColor: '#fdfcfb',
                                      border: '1px solid #e5e7eb',
                                      fontSize: '0.95rem'
                                    }}
                                    value={w.role || ""}
                                    onChange={(e) => updateField("tworker", i, "role", e.target.value)}
                                  >
                                    <option value="">Select Role</option>
                                    {workerRoles.map((role, idx) => (
                                      <option key={idx} value={role}>{role}</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="col-md-3">
                                  <label className="form-label small text-muted">Hours Deployed</label>
                                  <input
                                    type="number"
                                    placeholder="Hours"
                                    className="form-control py-2"
                                    style={{
                                      borderRadius: '12px',
                                      backgroundColor: '#fdfcfb',
                                      border: '1px solid #e5e7eb',
                                      fontSize: '0.95rem'
                                    }}
                                    value={w.hoursWorked || ""}
                                    onChange={(e) => updateField("tworker", i, "hoursWorked", e.target.value)}
                                  />
                                </div>
                                <div className="col-md-1 d-flex align-items-end">
                                  <button
                                    type="button"
                                    className="btn btn-outline-danger btn-sm w-100 py-2"
                                    style={{ borderRadius: '12px' }}
                                    onClick={() => removeField("tworker", i)}
                                  >
                                    <BsDashCircle />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="row">
                        <div className="col-12">
                          <button
                            type="button"
                            className="btn btn-outline-warning mb-3"
                            style={{ borderRadius: '20px', fontWeight: '600' }}
                            onClick={() => addField("tworker", { name: "", role: "", hoursWorked: 0 })}
                          >
                            <BsPlusCircle className="me-2" /> Augment Workforce
                          </button>
                          {form.tworker.length === 0 && (
                            <small className="text-muted d-block mt-2">No workforce logged yet. Add team members to track deployment.</small>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Engineers Section - FIXED: Similar structure */}
                    <div className="mb-5">
                      <h5 className="fw-bold mb-4" style={{
                        color: '#d4af37',
                        borderBottom: '3px solid #f8f7f4',
                        paddingBottom: '1rem',
                        fontSize: '1.25rem'
                      }}>
                        <BsPersonCheck className="me-3 text-muted fs-5" /> Engineering Vanguard
                      </h5>
                      {form.tengineer.map((en, i) => (
                        <div key={i} className="row mb-3">
                          <div className="col-12">
                            <div className="p-4 border rounded-3 bg-light" style={{ borderColor: '#f8f7f4' }}>
                              <div className="row g-3">
                                <div className="col-md-4">
                                  <label className="form-label small text-muted">Name</label>
                                  <input
                                    className="form-control py-2"
                                    placeholder="Engineer Name"
                                    style={{
                                      borderRadius: '12px',
                                      backgroundColor: '#fdfcfb',
                                      border: '1px solid #e5e7eb',
                                      fontSize: '0.95rem'
                                    }}
                                    value={en.name || ""}
                                    onChange={(e) => updateField("tengineer", i, "name", e.target.value)}
                                  />
                                </div>
                                <div className="col-md-4">
                                  <label className="form-label small text-muted">Specialty</label>
                                  <select
                                    className="form-select py-2"
                                    style={{
                                      borderRadius: '12px',
                                      backgroundColor: '#fdfcfb',
                                      border: '1px solid #e5e7eb',
                                      fontSize: '0.95rem'
                                    }}
                                    value={en.specialty || ""}
                                    onChange={(e) => updateField("tengineer", i, "specialty", e.target.value)}
                                  >
                                    <option value="">Select Specialty</option>
                                    {engineerSpecialties.map((spec, idx) => (
                                      <option key={idx} value={spec}>{spec}</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="col-md-3">
                                  <label className="form-label small text-muted">Hours</label>
                                  <input
                                    type="number"
                                    placeholder="Hours"
                                    className="form-control py-2"
                                    style={{
                                      borderRadius: '12px',
                                      backgroundColor: '#fdfcfb',
                                      border: '1px solid #e5e7eb',
                                      fontSize: '0.95rem'
                                    }}
                                    value={en.hoursWorked || ""}
                                    onChange={(e) => updateField("tengineer", i, "hoursWorked", e.target.value)}
                                  />
                                </div>
                                <div className="col-md-1 d-flex align-items-end">
                                  <button
                                    type="button"
                                    className="btn btn-outline-danger btn-sm w-100 py-2"
                                    style={{ borderRadius: '12px' }}
                                    onClick={() => removeField("tengineer", i)}
                                  >
                                    <BsDashCircle />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="row">
                        <div className="col-12">
                          <button
                            type="button"
                            className="btn btn-outline-warning mb-3"
                            style={{ borderRadius: '20px', fontWeight: '600' }}
                            onClick={() => addField("tengineer", { name: "", specialty: "", hoursWorked: 0 })}
                          >
                            <BsPlusCircle className="me-2" /> Bolster Engineering
                          </button>
                          {form.tengineer.length === 0 && (
                            <small className="text-muted d-block mt-2">No engineers logged. Document technical oversight here.</small>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Continue with similar fixes for other sections... */}
                    {/* Architects, Managers, Materials, Tools, Expenses - All using col-12 wrapper with inner row g-3 for alignment */}

                    {/* Architects Section */}
                    <div className="mb-5">
                      <h5 className="fw-bold mb-4" style={{
                        color: '#d4af37',
                        borderBottom: '3px solid #f8f7f4',
                        paddingBottom: '1rem',
                        fontSize: '1.25rem'
                      }}>
                        <BsFileText className="me-3 text-muted fs-5" /> Architectural Visionaries
                      </h5>
                      {form.tarchitect.map((ar, i) => (
                        <div key={i} className="row mb-3">
                          <div className="col-12">
                            <div className="p-4 border rounded-3 bg-light" style={{ borderColor: '#f8f7f4' }}>
                              <div className="row g-3">
                                <div className="col-md-4">
                                  <label className="form-label small text-muted">Name</label>
                                  <input
                                    className="form-control py-2"
                                    placeholder="Architect Name"
                                    style={{
                                      borderRadius: '12px',
                                      backgroundColor: '#fdfcfb',
                                      border: '1px solid #e5e7eb',
                                      fontSize: '0.95rem'
                                    }}
                                    value={ar.name || ""}
                                    onChange={(e) => updateField("tarchitect", i, "name", e.target.value)}
                                  />
                                </div>
                                <div className="col-md-4">
                                  <label className="form-label small text-muted">Specialty</label>
                                  <select
                                    className="form-select py-2"
                                    style={{
                                      borderRadius: '12px',
                                      backgroundColor: '#fdfcfb',
                                      border: '1px solid #e5e7eb',
                                      fontSize: '0.95rem'
                                    }}
                                    value={ar.specialty || ""}
                                    onChange={(e) => updateField("tarchitect", i, "specialty", e.target.value)}
                                  >
                                    <option value="">Select Specialty</option>
                                    {architectSpecialties.map((spec, idx) => (
                                      <option key={idx} value={spec}>{spec}</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="col-md-3">
                                  <label className="form-label small text-muted">Hours</label>
                                  <input
                                    type="number"
                                    placeholder="Hours"
                                    className="form-control py-2"
                                    style={{
                                      borderRadius: '12px',
                                      backgroundColor: '#fdfcfb',
                                      border: '1px solid #e5e7eb',
                                      fontSize: '0.95rem'
                                    }}
                                    value={ar.hoursWorked || ""}
                                    onChange={(e) => updateField("tarchitect", i, "hoursWorked", e.target.value)}
                                  />
                                </div>
                                <div className="col-md-1 d-flex align-items-end">
                                  <button
                                    type="button"
                                    className="btn btn-outline-danger btn-sm w-100 py-2"
                                    style={{ borderRadius: '12px' }}
                                    onClick={() => removeField("tarchitect", i)}
                                  >
                                    <BsDashCircle />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="row">
                        <div className="col-12">
                          <button
                            type="button"
                            className="btn btn-outline-warning mb-3"
                            style={{ borderRadius: '20px', fontWeight: '600' }}
                            onClick={() => addField("tarchitect", { name: "", specialty: "", hoursWorked: 0 })}
                          >
                            <BsPlusCircle className="me-2" /> Enhance Design
                          </button>
                          {form.tarchitect.length === 0 && (
                            <small className="text-muted d-block mt-2">No architects logged. Record design contributions.</small>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Project Managers Section */}
                    <div className="mb-5">
                      <h5 className="fw-bold mb-4" style={{
                        color: '#d4af37',
                        borderBottom: '3px solid #f8f7f4',
                        paddingBottom: '1rem',
                        fontSize: '1.25rem'
                      }}>
                        <BsPeople className="me-3 text-muted fs-5" /> Leadership Cadre
                      </h5>
                      {form.tprojectManager.map((pm, i) => (
                        <div key={i} className="row mb-3">
                          <div className="col-12">
                            <div className="p-4 border rounded-3 bg-light" style={{ borderColor: '#f8f7f4' }}>
                              <div className="row g-3">
                                <div className="col-md-5">
                                  <label className="form-label small text-muted">Name</label>
                                  <input
                                    className="form-control py-2"
                                    placeholder="Project Manager Name"
                                    style={{
                                      borderRadius: '12px',
                                      backgroundColor: '#fdfcfb',
                                      border: '1px solid #e5e7eb',
                                      fontSize: '0.95rem'
                                    }}
                                    value={pm.name || ""}
                                    onChange={(e) => updateField("tprojectManager", i, "name", e.target.value)}
                                  />
                                </div>
                                <div className="col-md-5">
                                  <label className="form-label small text-muted">Contact</label>
                                  <input
                                    className="form-control py-2"
                                    placeholder="Contact Info"
                                    style={{
                                      borderRadius: '12px',
                                      backgroundColor: '#fdfcfb',
                                      border: '1px solid #e5e7eb',
                                      fontSize: '0.95rem'
                                    }}
                                    value={pm.contact || ""}
                                    onChange={(e) => updateField("tprojectManager", i, "contact", e.target.value)}
                                  />
                                </div>
                                <div className="col-md-2 d-flex align-items-end">
                                  <button
                                    type="button"
                                    className="btn btn-outline-danger btn-sm w-100 py-2"
                                    style={{ borderRadius: '12px' }}
                                    onClick={() => removeField("tprojectManager", i)}
                                  >
                                    <BsDashCircle />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="row">
                        <div className="col-12">
                          <button
                            type="button"
                            className="btn btn-outline-warning mb-3"
                            style={{ borderRadius: '20px', fontWeight: '600' }}
                            onClick={() => addField("tprojectManager", { name: "", contact: "" })}
                          >
                            <BsPlusCircle className="me-2" /> Assign Leadership
                          </button>
                          {form.tprojectManager.length === 0 && (
                            <small className="text-muted d-block mt-2">No managers assigned. Log oversight personnel.</small>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Materials Section */}
                    <div className="mb-5">
                      <h5 className="fw-bold mb-4" style={{
                        color: '#d4af37',
                        borderBottom: '3px solid #f8f7f4',
                        paddingBottom: '1rem',
                        fontSize: '1.25rem'
                      }}>
                        <BsHddStack className="me-3 text-muted fs-5" /> Resource Allocation
                      </h5>
                      {form.tmaterials.map((mat, i) => (
                        <div key={i} className="row mb-3">
                          <div className="col-12">
                            <div className="p-4 border rounded-3 bg-light" style={{ borderColor: '#f8f7f4' }}>
                              <div className="row g-3">
                                <div className="col-md-3">
                                  <label className="form-label small text-muted">Material</label>
                                  <select
                                    className="form-select py-2"
                                    style={{
                                      borderRadius: '12px',
                                      backgroundColor: '#fdfcfb',
                                      border: '1px solid #e5e7eb',
                                      fontSize: '0.95rem'
                                    }}
                                    value={mat.name || ""}
                                    onChange={(e) => updateField("tmaterials", i, "name", e.target.value)}
                                  >
                                    <option value="">Select Material</option>
                                    {materialNames.map((m, idx) => (
                                      <option key={idx} value={m}>{m}</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="col-md-2">
                                  <label className="form-label small text-muted">Quantity</label>
                                  <input
                                    type="number"
                                    placeholder="Qty"
                                    className="form-control py-2"
                                    style={{
                                      borderRadius: '12px',
                                      backgroundColor: '#fdfcfb',
                                      border: '1px solid #e5e7eb',
                                      fontSize: '0.95rem'
                                    }}
                                    value={mat.quantity || ""}
                                    onChange={(e) => updateField("tmaterials", i, "quantity", e.target.value)}
                                  />
                                </div>
                                <div className="col-md-2">
                                  <label className="form-label small text-muted">Unit</label>
                                  <input
                                    placeholder="Unit"
                                    className="form-control py-2"
                                    style={{
                                      borderRadius: '12px',
                                      backgroundColor: '#fdfcfb',
                                      border: '1px solid #e5e7eb',
                                      fontSize: '0.95rem'
                                    }}
                                    value={mat.unit || ""}
                                    onChange={(e) => updateField("tmaterials", i, "unit", e.target.value)}
                                  />
                                </div>
                                <div className="col-md-3">
                                  <label className="form-label small text-muted">Cost ($)</label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    placeholder="Cost"
                                    className="form-control py-2"
                                    style={{
                                      borderRadius: '12px',
                                      backgroundColor: '#fdfcfb',
                                      border: '1px solid #e5e7eb',
                                      fontSize: '0.95rem'
                                    }}
                                    value={mat.cost || ""}
                                    onChange={(e) => updateField("tmaterials", i, "cost", e.target.value)}
                                  />
                                </div>
                                <div className="col-md-2 d-flex align-items-end">
                                  <button
                                    type="button"
                                    className="btn btn-outline-danger btn-sm w-100 py-2"
                                    style={{ borderRadius: '12px' }}
                                    onClick={() => removeField("tmaterials", i)}
                                  >
                                    <BsDashCircle />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="row">
                        <div className="col-12">
                          <button
                            type="button"
                            className="btn btn-outline-warning mb-3"
                            style={{ borderRadius: '20px', fontWeight: '600' }}
                            onClick={() => addField("tmaterials", { name: "", quantity: 0, unit: "", cost: 0 })}
                          >
                            <BsPlusCircle className="me-2" /> Provision Materials
                          </button>
                          {form.tmaterials.length === 0 && (
                            <small className="text-muted d-block mt-2">No materials tracked. Inventory assets deployed today.</small>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Tools Section */}
                    <div className="mb-5">
                      <h5 className="fw-bold mb-4" style={{
                        color: '#d4af37',
                        borderBottom: '3px solid #f8f7f4',
                        paddingBottom: '1rem',
                        fontSize: '1.25rem'
                      }}>
                        <BsTools className="me-3 text-muted fs-5" /> Equipment Arsenal
                      </h5>
                      {form.ttools.map((tool, i) => (
                        <div key={i} className="row mb-3">
                          <div className="col-12">
                            <div className="p-4 border rounded-3 bg-light" style={{ borderColor: '#f8f7f4' }}>
                              <div className="row g-3">
                                <div className="col-md-4">
                                  <label className="form-label small text-muted">Tool</label>
                                  <select
                                    className="form-select py-2"
                                    style={{
                                      borderRadius: '12px',
                                      backgroundColor: '#fdfcfb',
                                      border: '1px solid #e5e7eb',
                                      fontSize: '0.95rem'
                                    }}
                                    value={tool.name || ""}
                                    onChange={(e) => updateField("ttools", i, "name", e.target.value)}
                                  >
                                    <option value="">Select Tool</option>
                                    {toolNames.map((t, idx) => (
                                      <option key={idx} value={t}>{t}</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="col-md-3">
                                  <label className="form-label small text-muted">Quantity</label>
                                  <input
                                    type="number"
                                    placeholder="Qty"
                                    className="form-control py-2"
                                    style={{
                                      borderRadius: '12px',
                                      backgroundColor: '#fdfcfb',
                                      border: '1px solid #e5e7eb',
                                      fontSize: '0.95rem'
                                    }}
                                    value={tool.quantity || ""}
                                    onChange={(e) => updateField("ttools", i, "quantity", e.target.value)}
                                  />
                                </div>
                                <div className="col-md-3">
                                  <label className="form-label small text-muted">Status</label>
                                  <select
                                    className="form-select py-2"
                                    style={{
                                      borderRadius: '12px',
                                      backgroundColor: '#fdfcfb',
                                      border: '1px solid #e5e7eb',
                                      fontSize: '0.95rem'
                                    }}
                                    value={tool.status || ""}
                                    onChange={(e) => updateField("ttools", i, "status", e.target.value)}
                                  >
                                    <option value="">Select Status</option>
                                    <option value="Available">🟢 Available</option>
                                    <option value="In Use">🟡 In Use</option>
                                    <option value="Maintenance">🟠 Maintenance</option>
                                    <option value="Damaged">🔴 Damaged</option>
                                  </select>
                                </div>
                                <div className="col-md-2 d-flex align-items-end">
                                  <button
                                    type="button"
                                    className="btn btn-outline-danger btn-sm w-100 py-2"
                                    style={{ borderRadius: '12px' }}
                                    onClick={() => removeField("ttools", i)}
                                  >
                                    <BsDashCircle />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="row">
                        <div className="col-12">
                          <button
                            type="button"
                            className="btn btn-outline-warning mb-3"
                            style={{ borderRadius: '20px', fontWeight: '600' }}
                            onClick={() => addField("ttools", { name: "", quantity: 0, status: "" })}
                          >
                            <BsPlusCircle className="me-2" /> Mobilize Equipment
                          </button>
                          {form.ttools.length === 0 && (
                            <small className="text-muted d-block mt-2">No tools tracked. Log equipment utilization.</small>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expenses Section */}
                    <div className="mb-5">
                      <h5 className="fw-bold mb-4" style={{
                        color: '#d4af37',
                        borderBottom: '3px solid #f8f7f4',
                        paddingBottom: '1rem',
                        fontSize: '1.25rem'
                      }}>
                        <BsCurrencyDollar className="me-3 text-muted fs-5" /> Fiscal Ledger
                      </h5>
                      {form.texpenses.map((ex, i) => (
                        <div key={i} className="row mb-3">
                          <div className="col-12">
                            <div className="p-4 border rounded-3 bg-light" style={{ borderColor: '#f8f7f4' }}>
                              <div className="row g-3">
                                <div className="col-md-5">
                                  <label className="form-label small text-muted">Description</label>
                                  <input
                                    className="form-control py-2"
                                    placeholder="Expense Description"
                                    style={{
                                      borderRadius: '12px',
                                      backgroundColor: '#fdfcfb',
                                      border: '1px solid #e5e7eb',
                                      fontSize: '0.95rem'
                                    }}
                                    value={ex.description || ""}
                                    onChange={(e) => updateField("texpenses", i, "description", e.target.value)}
                                  />
                                </div>
                                <div className="col-md-3">
                                  <label className="form-label small text-muted">Amount ($)</label>
                                  <div className="input-group">
                                    <span className="input-group-text bg-transparent border-end-0 text-muted fs-6" style={{
                                      backgroundColor: '#fdfcfb',
                                      borderColor: '#e5e7eb',
                                      borderRight: 'none !important'
                                    }}>$</span>
                                    <input
                                      type="number"
                                      step="0.01"
                                      placeholder="Amount"
                                      className="form-control py-2"
                                      style={{
                                        borderRadius: '12px',
                                        backgroundColor: '#fdfcfb',
                                        borderLeft: 'none',
                                        fontSize: '0.95rem'
                                      }}
                                      value={ex.amount || ""}
                                      onChange={(e) => updateField("texpenses", i, "amount", e.target.value)}
                                    />
                                  </div>
                                </div>
                                <div className="col-md-2">
                                  <label className="form-label small text-muted">Date</label>
                                  <input
                                    type="date"
                                    className="form-control py-2"
                                    style={{
                                      borderRadius: '12px',
                                      backgroundColor: '#fdfcfb',
                                      border: '1px solid #e5e7eb',
                                      fontSize: '0.95rem'
                                    }}
                                    value={ex.date || ""}
                                    onChange={(e) => updateField("texpenses", i, "date", e.target.value)}
                                  />
                                </div>
                                <div className="col-md-2 d-flex align-items-end">
                                  <button
                                    type="button"
                                    className="btn btn-outline-danger btn-sm w-100 py-2"
                                    style={{ borderRadius: '12px' }}
                                    onClick={() => removeField("texpenses", i)}
                                  >
                                    <BsDashCircle />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="row">
                        <div className="col-12">
                          <button
                            type="button"
                            className="btn btn-outline-warning mb-3"
                            style={{ borderRadius: '20px', fontWeight: '600' }}
                            onClick={() => addField("texpenses", { description: "", amount: 0, date: "" })}
                          >
                            <BsPlusCircle className="me-2" /> Ledger Expenditure
                          </button>
                          {form.texpenses.length === 0 && (
                            <small className="text-muted d-block mt-2">No expenses recorded. Track daily fiscal outflows.</small>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Notes Section */}
                    <div className="mb-5">
                      <h5 className="fw-bold mb-4" style={{
                        color: '#d4af37',
                        borderBottom: '3px solid #f8f7f4',
                        paddingBottom: '1rem',
                        fontSize: '1.25rem'
                      }}>
                        <BsFileText className="me-3 text-muted fs-5" /> Ephemeral Notes
                      </h5>
                      <div className="row g-4 justify-content-center">
                        <div className="col-12">
                          <label className="form-label fw-semibold mb-2" style={{ color: '#374151' }}>
                            Site Codex
                          </label>
                          <textarea
                            className="form-control"
                            rows="4"
                            style={{
                              borderRadius: '16px',
                              backgroundColor: '#fdfcfb',
                              padding: '1.25rem',
                              border: '1px solid #e5e7eb',
                              boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)',
                              transition: 'all 0.2s ease',
                              fontSize: '1rem',
                              minHeight: '140px',
                              resize: 'vertical'
                            }}
                            placeholder="Etch observations, delays, or pivotal events with narrative depth..."
                            value={form.tnotes}
                            onChange={(e) => setForm(prev => ({ ...prev, tnotes: e.target.value }))}
                          />
                          <small className="form-text text-muted mt-1">
                            Preserve the day's essence for posterity and analysis.
                          </small>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Submit Button */}
                    <div className="text-end">
                      <button
                        type="submit"
                        className="btn btn-lg px-6 py-3 fw-semibold"
                        style={{
                          borderRadius: '50px',
                          background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                          border: 'none',
                          color: '#fff',
                          fontSize: '1.1rem',
                          boxShadow: '0 8px 25px rgba(212, 175, 55, 0.4)',
                          transition: 'all 0.3s ease',
                          minWidth: '220px'
                        }}
                        disabled={loading || !projectDetails}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" style={{ width: '1rem', height: '1rem' }}></span>
                            Chronicling Epoch...
                          </>
                        ) : (
                          <>
                            <BsSave className="me-2" />
                            Eternalize Chronicle
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
    </div>
  );
}