import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Nav from "../Nav/Nav";

const URL = "http://localhost:5050/projects";

async function fetchHandlers() {
  try {
    const res = await axios.get(URL);
    // Support either {projects:[...]} or just [...]
    return Array.isArray(res.data) ? res.data : (res.data?.projects ?? []);
  } catch (err) {
    console.error("Error fetching projects:", err);
    return [];
  }
}

export default function ProjectsDisplay() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("pcreatedat");
  const [sortDirection, setSortDirection] = useState("desc");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    const data = await fetchHandlers();
    setProjects(data || []);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("⚠️ Are you sure you want to delete this project? This action cannot be undone.")) {
      try {
        await axios.delete(`http://localhost:5050/projects/${id}`);
        setProjects(projects.filter(p => p._id !== id));
        // Show success message
        const alert = document.createElement('div');
        alert.className = 'alert alert-success alert-dismissible fade show position-fixed';
        alert.style.cssText = 'top: 20px; right: 20px; z-index: 1050; min-width: 300px;';
        alert.innerHTML = `
          <strong>✅ Success!</strong> Project deleted successfully.
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(alert);
        setTimeout(() => alert.remove(), 3000);
      } catch (error) {
        console.error("Error deleting project:", error);
        alert("❌ Error deleting project. Please try again.");
      }
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortedAndFilteredProjects = () => {
    let filtered = projects.filter(project => 
      (project.pname && project.pname.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (project.plocation && project.plocation.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (project.pdescription && project.pdescription.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (project.pobservations && project.pobservations.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return filtered.sort((a, b) => {
      let aVal, bVal;
      
      switch (sortField) {
        case "pcreatedat":
          aVal = new Date(a.pcreatedat);
          bVal = new Date(b.pcreatedat);
          break;
        case "pbudget":
          aVal = parseFloat(a.pbudget) || 0;
          bVal = parseFloat(b.pbudget) || 0;
          break;
        case "pstatus":
          aVal = a.pstatus || "";
          bVal = b.pstatus || "";
          break;
        case "ppriority":
          aVal = a.ppriority || "";
          bVal = b.ppriority || "";
          break;
        case "penddate":
          aVal = new Date(a.penddate);
          bVal = new Date(b.penddate);
          break;
        default:
          aVal = a[sortField] || "";
          bVal = b[sortField] || "";
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  };

  const calculateTotalBudget = () => {
    return projects.reduce((sum, p) => sum + (parseFloat(p.pbudget) || 0), 0);
  };

  const calculateActiveProjects = () => {
    return projects.filter(p => p.pstatus === "In Progress").length;
  };

  const calculateTotalIssues = () => {
    return projects.reduce((sum, p) => sum + (p.pissues?.length || 0), 0);
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return "↕️";
    return sortDirection === "asc" ? "⬆️" : "⬇️";
  };

  if (loading) {
    return (
      <>
        <Nav />
        <div className="container mt-4">
          <div className="text-center">
            <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading project records...</p>
          </div>
        </div>
      </>
    );
  }

  const sortedProjects = getSortedAndFilteredProjects();

  return (
    <>
      <Nav />
      <div className="container mt-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow">
              <div className="card-header bg-primary text-white">
                <div className="row align-items-center">
                  <div className="col-md-6">
                    <h2 className="mb-0">🏗️ Project Management</h2>
                    <p className="mb-0 opacity-75">Track and manage construction projects</p>
                  </div>
                  <div className="col-md-6 text-end">
                    <button 
                      className="btn btn-light btn-lg"
                      onClick={() => navigate("/add-project")}
                    >
                      ➕ Add New Project
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card text-center border-primary">
              <div className="card-body">
                <h5 className="card-title text-primary">📋 Total Projects</h5>
                <h2 className="text-primary">{projects.length}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center border-success">
              <div className="card-body">
                <h5 className="card-title text-success">💰 Total Budget</h5>
                <h2 className="text-success">
                  ${calculateTotalBudget().toLocaleString()}
                </h2>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center border-info">
              <div className="card-body">
                <h5 className="card-title text-info">🚧 Active Projects</h5>
                <h2 className="text-info">
                  {calculateActiveProjects()}
                </h2>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center border-danger">
              <div className="card-body">
                <h5 className="card-title text-danger">⚠️ Total Issues</h5>
                <h2 className="text-danger">
                  {calculateTotalIssues()}
                </h2>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col-md-6">
                    <div className="input-group">
                      <span className="input-group-text">🔍</span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search by name, location, or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      {searchTerm && (
                        <button 
                          className="btn btn-outline-secondary"
                          onClick={() => setSearchTerm("")}
                        >
                          ❌
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6 text-end">
                    <small className="text-muted">
                      Showing {sortedProjects.length} of {projects.length} records
                    </small>
                    <button 
                      className="btn btn-outline-primary btn-sm ms-3"
                      onClick={fetchProjects}
                    >
                      🔄 Refresh
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Project Records Table */}
        <div className="card shadow">
          <div className="card-header bg-light">
            <h5 className="mb-0">📊 Project Records</h5>
          </div>
          <div className="card-body p-0">
            {sortedProjects.length === 0 ? (
              <div className="text-center p-5">
                <div className="mb-3">
                  <span style={{fontSize: '4rem'}}>🏗️</span>
                </div>
                <h4 className="text-muted">No project records found</h4>
                <p className="text-muted">
                  {searchTerm ? 'Try adjusting your search terms.' : 'Start by creating your first project entry.'}
                </p>
                {!searchTerm && (
                  <button 
                    className="btn btn-primary btn-lg mt-3"
                    onClick={() => navigate("/add-project")}
                  >
                    ➕ Create First Project
                  </button>
                )}
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th 
                        style={{cursor: 'pointer', userSelect: 'none'}}
                        onClick={() => handleSort("pname")}
                      >
                        📋 Name {getSortIcon("pname")}
                      </th>
                      <th 
                        style={{cursor: 'pointer', userSelect: 'none'}}
                        onClick={() => handleSort("pcode")}
                      >
                        🔢 Code {getSortIcon("pcode")}
                      </th>
                      <th 
                        style={{cursor: 'pointer', userSelect: 'none'}}
                        onClick={() => handleSort("plocation")}
                      >
                        📍 Location {getSortIcon("plocation")}
                      </th>
                      <th 
                        style={{cursor: 'pointer', userSelect: 'none'}}
                        onClick={() => handleSort("ptype")}
                      >
                        🏗️ Type {getSortIcon("ptype")}
                      </th>
                      <th 
                        style={{cursor: 'pointer', userSelect: 'none'}}
                        onClick={() => handleSort("pbudget")}
                      >
                        💰 Budget {getSortIcon("pbudget")}
                      </th>
                      <th 
                        style={{cursor: 'pointer', userSelect: 'none'}}
                        onClick={() => handleSort("pstatus")}
                      >
                        📊 Status {getSortIcon("pstatus")}
                      </th>
                      <th 
                        style={{cursor: 'pointer', userSelect: 'none'}}
                        onClick={() => handleSort("ppriority")}
                      >
                        ⚠️ Priority {getSortIcon("ppriority")}
                      </th>
                      <th 
                        style={{cursor: 'pointer', userSelect: 'none'}}
                        onClick={() => handleSort("pcreatedat")}
                      >
                        📅 Start Date {getSortIcon("pcreatedat")}
                      </th>
                      <th 
                        style={{cursor: 'pointer', userSelect: 'none'}}
                        onClick={() => handleSort("penddate")}
                      >
                        🗓️ End Date {getSortIcon("penddate")}
                      </th>
                      <th>📝 Notes</th>
                      <th>🔧 Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedProjects.map(project => (
                      <tr key={project._id}>
                        <td>
                          <strong>{project.pname}</strong>
                          <br />
                          <small className="text-muted">{project.pnumber}</small>
                        </td>
                        <td>{project.pcode}</td>
                        <td>{project.plocation}</td>
                        <td>
                          <span className="badge bg-info fs-6">
                            {project.ptype}
                          </span>
                        </td>
                        <td>
                          <span className="text-success fw-bold">
                            ${parseFloat(project.pbudget || 0).toLocaleString()}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-primary fs-6">
                            {project.pstatus}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-warning text-dark fs-6">
                            {project.ppriority}
                          </span>
                        </td>
                        <td>
                          <strong>
                            {new Date(project.pcreatedat).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </strong>
                          <br />
                          <small className="text-muted">
                            {new Date(project.pcreatedat).toLocaleDateString('en-US', { weekday: 'long' })}
                          </small>
                        </td>
                        <td>
                          <strong>
                            {new Date(project.penddate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </strong>
                          <br />
                          <small className="text-muted">
                            {new Date(project.penddate).toLocaleDateString('en-US', { weekday: 'long' })}
                          </small>
                        </td>
                        <td>
                          {project.pobservations ? (
                            <span 
                              className="text-truncate d-inline-block" 
                              style={{maxWidth: '150px'}}
                              title={project.pobservations}
                            >
                              {project.pobservations}
                            </span>
                          ) : (
                            <span className="text-muted">No notes</span>
                          )}
                        </td>
                        <td>
                          <div className="btn-group" role="group">
                            <button 
                              className="btn btn-outline-info btn-sm"
                              onClick={() => navigate(`/project-view/${project._id}`)}
                              title="View Details"
                            >
                              👁️
                            </button>
                            <button 
                              className="btn btn-outline-warning btn-sm"
                              onClick={() => navigate(`/projects/${project._id}`)}
                              title="Edit Project"
                            >
                              ✏️
                            </button>
                            <button 
                              onClick={() => handleDelete(project._id)} 
                              className="btn btn-outline-danger btn-sm"
                              title="Delete Project"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center text-muted">
          <p>
            <small>
              💡 Click on column headers to sort • Use search to filter records • 
              Click 👁️ to view details, ✏️ to edit, or 🗑️ to delete
            </small>
          </p>
        </div>
      </div>
    </>
  );
}