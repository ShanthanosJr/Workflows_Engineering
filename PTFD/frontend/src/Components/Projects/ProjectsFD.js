import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Nav from "../Nav/Nav";
import Projects from "./Projects"; // Assuming this is in the same folder

const URL = "http://localhost:5050/projects";

async function fetchHandlers() {
  try {
    const res = await axios.get(URL);
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
    console.log("useEffect running - fetching projects"); // Debug log (remove after testing)
    fetchProjects();
  }, []); // Empty dependency: runs once on mount

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
        setProjects((prev) => prev.filter((p) => p._id !== id)); // Immediate state update
        // Show success message (outside React to avoid re-render issues)
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
        window.alert("❌ Error deleting project. Please try again."); // Use window.alert to avoid React issues
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

  // Memoize sorted/filtered projects to prevent unnecessary re-computations/re-renders
  const sortedProjects = useMemo(() => {
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
        case "pname":
          aVal = a.pname || "";
          bVal = b.pname || "";
          break;
        default:
          aVal = a[sortField] || "";
          bVal = b[sortField] || "";
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [projects, searchTerm, sortField, sortDirection]); // Dependencies for memoization

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
                    <div className="d-flex justify-content-end align-items-center">
                      <div className="dropdown me-3">
                        <button
                          className="btn btn-outline-primary btn-sm dropdown-toggle"
                          type="button"
                          id="sortDropdown"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          Sort by: {sortField.replace('p', '')} {getSortIcon(sortField)}
                        </button>
                        <ul className="dropdown-menu" aria-labelledby="sortDropdown">
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => handleSort("pname")}
                            >
                              Name {getSortIcon("pname")}
                            </button>
                          </li>
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => handleSort("pbudget")}
                            >
                              Budget {getSortIcon("pbudget")}
                            </button>
                          </li>
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => handleSort("pstatus")}
                            >
                              Status {getSortIcon("pstatus")}
                            </button>
                          </li>
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => handleSort("ppriority")}
                            >
                              Priority {getSortIcon("ppriority")}
                            </button>
                          </li>
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => handleSort("pcreatedat")}
                            >
                              Start Date {getSortIcon("pcreatedat")}
                            </button>
                          </li>
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => handleSort("penddate")}
                            >
                              End Date {getSortIcon("penddate")}
                            </button>
                          </li>
                        </ul>
                      </div>
                      <small className="text-muted me-3">
                        Showing {sortedProjects.length} of {projects.length} records
                      </small>
                      <button 
                        className="btn btn-outline-primary btn-sm"
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
        </div>

        {/* Project Cards */}
        <div className="row justify-content-center">
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
            sortedProjects.map(project => (
              <div key={project._id} className="col-md-4 mb-4">
                <Projects project={project} onDelete={handleDelete} />
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 text-center text-muted">
          <p>
            <small>
              💡 Use the dropdown to sort • Use search to filter records • 
              Click 👁️ to view details, ✏️ to edit, or 🗑️ to delete
            </small>
          </p>
        </div>
      </div>
    </>
  );
}