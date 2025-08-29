import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Nav from "../Nav/Nav";

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

  // FIXED: Updated validate project function
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

  // FIXED: Updated handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!projectCode.trim()) {
      alert("Please enter a valid Project Code.");
      return;
    }

    if (!projectDetails) {
      alert("Please wait for project validation or enter a valid Project Code.");
      return;
    }

    try {
      const timelineData = {
        ...form,
        projectCode: projectCode, // Send as projectCode
        workerCount: form.tworker.length,
        tengineerCount: form.tengineer.length,
        architectCount: form.tarchitect.length
      };

      console.log('Sending timeline data:', timelineData); // Debug log

      const response = await axios.post("http://localhost:5050/project-timelines", timelineData);
      console.log('Timeline creation response:', response.data);
      
      alert("✅ Project timeline created successfully!");
      navigate("/project-timelines");
    } catch (error) {
      console.error("Error creating timeline:", error.response?.data || error.message);
      
      if (error.response?.data?.message) {
        alert(`❌ Error creating project timeline: ${error.response.data.message}`);
      } else {
        alert(`❌ Error creating project timeline: ${error.message}`);
      }
    }
  };

  return (
    <>
      <Nav />
      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="card shadow">
              <div className="card-header bg-success text-white">
                <h2 className="mb-0">Create New Project Timeline Entry</h2>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  {/* Project Code Section */}
                  <div className="mb-4">
                    <div className="card">
                      <div className="card-header bg-light">
                        <h5 className="mb-0">Project Information</h5>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-6">
                            <label className="form-label fw-bold">Project Code *</label>
                            <div className="input-group">
                              <input
                                type="text"
                                className={`form-control ${
                                  projectError
                                    ? "is-invalid"
                                    : projectDetails
                                    ? "is-valid"
                                    : ""
                                }`}
                                placeholder="Enter Project Code (e.g., PROJ001)"
                                value={projectCode}
                                onChange={handleProjectCodeChange}
                                required
                              />
                              {validatingProject && (
                                <span className="input-group-text">
                                  <div
                                    className="spinner-border spinner-border-sm"
                                    role="status"
                                  ></div>
                                </span>
                              )}
                            </div>
                            {projectError && (
                              <div className="invalid-feedback d-block">
                                {projectError}
                              </div>
                            )}
                            <small className="form-text text-muted">
                              Enter the project code (not the internal ID). This is the user-friendly project identifier.
                            </small>
                          </div>
                        </div>

                        {/* FIXED: Updated project details display */}
                        {projectDetails && (
                          <div className="mt-3 p-3 bg-light rounded">
                            <h6 className="text-success mb-2">✅ Project Found ✓</h6>
                            <div className="row">
                              <div className="col-md-6">
                                <p className="mb-1">
                                  <strong>Project Name:</strong> {projectDetails.pname || 'N/A'}
                                </p>
                                <p className="mb-1">
                                  <strong>Project Code:</strong> {projectDetails.pcode || 'N/A'}
                                </p>
                                <p className="mb-1">
                                  <strong>Project Number:</strong> {projectDetails.pnumber || 'N/A'}
                                </p>
                                <p className="mb-1">
                                  <strong>Owner:</strong> {projectDetails.powner || 'N/A'}
                                </p>
                              </div>
                              <div className="col-md-6">
                                <p className="mb-1">
                                  <strong>Status:</strong>
                                  <span className="badge bg-primary ms-1">
                                    {projectDetails.pstatus || 'N/A'}
                                  </span>
                                </p>
                                <p className="mb-1">
                                  <strong>Location:</strong> {projectDetails.plocation || 'N/A'}
                                </p>
                                {projectDetails.pcreatedAt && (
                                  <p className="mb-1">
                                    <strong>Created:</strong>{" "}
                                    {new Date(projectDetails.pcreatedAt).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="mb-4">
                    <label className="form-label fw-bold">Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={form.date}
                      onChange={(e) =>
                        setForm({ ...form, date: e.target.value })
                      }
                      required
                    />
                  </div>

                  {/* Workers Section */}
                  <div className="mb-4">
                    <div className="card">
                      <div className="card-header bg-primary text-white">
                        <h5 className="mb-0">Workers</h5>
                      </div>
                      <div className="card-body">
                        {form.tworker.map((w, i) => (
                          <div key={i} className="row mb-3 p-2 border rounded">
                            <div className="col-md-4">
                              <label className="form-label small">Name</label>
                              <input
                                placeholder="Worker Name"
                                className="form-control"
                                value={w.name || ""}
                                onChange={(e) =>
                                  updateField("tworker", i, "name", e.target.value)
                                }
                              />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label small">Role</label>
                              <select
                                className="form-select"
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
                              <label className="form-label small">Hours</label>
                              <input
                                placeholder="Hours"
                                type="number"
                                className="form-control"
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
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          onClick={() =>
                            addField("tworker", {
                              name: "",
                              role: "",
                              hoursWorked: 0
                            })
                          }
                        >
                          Add Worker
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Engineers Section */}
                  <div className="mb-4">
                    <div className="card">
                      <div className="card-header bg-success text-white">
                        <h5 className="mb-0">Engineers</h5>
                      </div>
                      <div className="card-body">
                        {form.tengineer.map((en, i) => (
                          <div key={i} className="row mb-3 p-2 border rounded">
                            <div className="col-md-4">
                              <label className="form-label small">Name</label>
                              <input
                                className="form-control"
                                placeholder="Engineer Name"
                                value={en.name || ""}
                                onChange={(e) =>
                                  updateField("tengineer", i, "name", e.target.value)
                                }
                              />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label small">Specialty</label>
                              <select
                                className="form-select"
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
                              <label className="form-label small">Hours</label>
                              <input
                                placeholder="Hours"
                                type="number"
                                className="form-control"
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
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="btn btn-outline-success"
                          onClick={() =>
                            addField("tengineer", { name: "", specialty: "", hoursWorked: 0 })
                          }
                        >
                          Add Engineer
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Architects Section */}
                  <div className="mb-4">
                    <div className="card">
                      <div className="card-header bg-info text-white">
                        <h5 className="mb-0">Architects</h5>
                      </div>
                      <div className="card-body">
                        {form.tarchitect.map((ar, i) => (
                          <div key={i} className="row mb-3 p-2 border rounded">
                            <div className="col-md-4">
                              <label className="form-label small">Name</label>
                              <input
                                className="form-control"
                                placeholder="Architect Name"
                                value={ar.name || ""}
                                onChange={(e) =>
                                  updateField("tarchitect", i, "name", e.target.value)
                                }
                              />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label small">Specialty</label>
                              <select
                                className="form-select"
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
                              <label className="form-label small">Hours</label>
                              <input
                                placeholder="Hours"
                                type="number"
                                className="form-control"
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
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="btn btn-outline-info"
                          onClick={() =>
                            addField("tarchitect", { name: "", specialty: "", hoursWorked: 0 })
                          }
                        >
                          Add Architect
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Project Managers Section */}
                  <div className="mb-4">
                    <div className="card">
                      <div className="card-header bg-secondary text-white">
                        <h5 className="mb-0">Project Managers</h5>
                      </div>
                      <div className="card-body">
                        {form.tprojectManager.map((pm, i) => (
                          <div key={i} className="row mb-3 p-2 border rounded">
                            <div className="col-md-5">
                              <label className="form-label small">Name</label>
                              <input
                                className="form-control"
                                placeholder="Project Manager Name"
                                value={pm.name || ""}
                                onChange={(e) =>
                                  updateField("tprojectManager", i, "name", e.target.value)
                                }
                              />
                            </div>
                            <div className="col-md-5">
                              <label className="form-label small">Contact</label>
                              <input
                                className="form-control"
                                placeholder="Contact Info"
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
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() =>
                            addField("tprojectManager", { name: "", contact: "" })
                          }
                        >
                          Add Project Manager
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Materials Section */}
                  <div className="mb-4">
                    <div className="card">
                      <div className="card-header bg-warning">
                        <h5 className="mb-0">Materials</h5>
                      </div>
                      <div className="card-body">
                        {form.tmaterials.map((mat, i) => (
                          <div key={i} className="row mb-3 p-2 border rounded">
                            <div className="col-md-3">
                              <label className="form-label small">Material</label>
                              <select
                                className="form-select"
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
                              <label className="form-label small">Quantity</label>
                              <input
                                className="form-control"
                                type="number"
                                placeholder="Quantity"
                                value={mat.quantity || ""}
                                onChange={(e) =>
                                  updateField("tmaterials", i, "quantity", e.target.value)
                                }
                              />
                            </div>
                            <div className="col-md-2">
                              <label className="form-label small">Unit</label>
                              <input
                                className="form-control"
                                placeholder="Unit"
                                value={mat.unit || ""}
                                onChange={(e) =>
                                  updateField("tmaterials", i, "unit", e.target.value)
                                }
                              />
                            </div>
                            <div className="col-md-3">
                              <label className="form-label small">Cost</label>
                              <input
                                className="form-control"
                                type="number"
                                step="0.01"
                                placeholder="Cost"
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
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="btn btn-outline-warning"
                          onClick={() =>
                            addField("tmaterials", { name: "", quantity: 0, unit: "", cost: 0 })
                          }
                        >
                          Add Material
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Tools Section */}
                  <div className="mb-4">
                    <div className="card">
                      <div className="card-header bg-dark text-white">
                        <h5 className="mb-0">Tools</h5>
                      </div>
                      <div className="card-body">
                        {form.ttools.map((tool, i) => (
                          <div key={i} className="row mb-3 p-2 border rounded">
                            <div className="col-md-4">
                              <label className="form-label small">Tool</label>
                              <select
                                className="form-select"
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
                              <label className="form-label small">Quantity</label>
                              <input
                                className="form-control"
                                type="number"
                                placeholder="Quantity"
                                value={tool.quantity || ""}
                                onChange={(e) =>
                                  updateField("ttools", i, "quantity", e.target.value)
                                }
                              />
                            </div>
                            <div className="col-md-3">
                              <label className="form-label small">Status</label>
                              <select
                                className="form-select"
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
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="btn btn-outline-dark"
                          onClick={() =>
                            addField("ttools", { name: "", quantity: 0, status: "" })
                          }
                        >
                          Add Tool
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expenses Section */}
                  <div className="mb-4">
                    <div className="card">
                      <div className="card-header bg-danger text-white">
                        <h5 className="mb-0">Expenses</h5>
                      </div>
                      <div className="card-body">
                        {form.texpenses.map((ex, i) => (
                          <div key={i} className="row mb-3 p-2 border rounded">
                            <div className="col-md-5">
                              <label className="form-label small">Description</label>
                              <input
                                className="form-control"
                                placeholder="Expense Description"
                                value={ex.description || ""}
                                onChange={(e) =>
                                  updateField("texpenses", i, "description", e.target.value)
                                }
                              />
                            </div>
                            <div className="col-md-3">
                              <label className="form-label small">Amount</label>
                              <input
                                className="form-control"
                                type="number"
                                step="0.01"
                                placeholder="Amount"
                                value={ex.amount || ""}
                                onChange={(e) =>
                                  updateField("texpenses", i, "amount", e.target.value)
                                }
                              />
                            </div>
                            <div className="col-md-2">
                              <label className="form-label small">Date</label>
                              <input
                                className="form-control"
                                type="date"
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
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={() =>
                            addField("texpenses", { description: "", amount: 0, date: "" })
                          }
                        >
                          Add Expense
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="mb-4">
                    <label className="form-label fw-bold">Notes</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Enter timeline notes"
                      value={form.tnotes}
                      onChange={(e) =>
                        setForm({ ...form, tnotes: e.target.value })
                      }
                    />
                  </div>

                  {/* Submit */}
                  <button type="submit" className="btn btn-success btn-lg">
                    Save Timeline Entry
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}