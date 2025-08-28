import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ProjectsView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProject = () => {
    setLoading(true);
    setError(null);
    
    axios
      .get(`http://localhost:5050/projects/${id}`)
      .then((res) => {
        setProject(res.data.project || res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching project:", err);
        setError("Failed to load project data");
        setProject(null);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-success';
      case 'in progress':
        return 'bg-warning text-dark';
      case 'on hold':
        return 'bg-secondary';
      case 'cancelled':
        return 'bg-danger';
      default:
        return 'bg-info';
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-danger';
      case 'medium':
        return 'bg-warning text-dark';
      case 'low':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateProjectDuration = () => {
    if (!project.pcreatedat || !project.penddate) return null;
    const start = new Date(project.pcreatedat);
    const end = new Date(project.penddate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getProjectProgress = () => {
    if (!project.pcreatedat || !project.penddate) return 0;
    const start = new Date(project.pcreatedat);
    const end = new Date(project.penddate);
    const now = new Date();
    
    if (now >= end) return 100;
    if (now <= start) return 0;
    
    const totalDuration = end - start;
    const elapsed = now - start;
    return Math.round((elapsed / totalDuration) * 100);
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted fs-5">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card border-danger">
              <div className="card-body text-center">
                <div className="mb-3">
                  <span style={{fontSize: '4rem', color: '#dc3545'}}>⚠️</span>
                </div>
                <h4 className="card-title text-danger">Project Not Found</h4>
                <p className="card-text text-muted">
                  {error || "The requested project could not be found or may have been deleted."}
                </p>
                <div className="mt-4">
                  <button 
                    className="btn btn-primary me-2"
                    onClick={() => navigate("/projects")}
                  >
                    ← Back to Projects
                  </button>
                  <button 
                    className="btn btn-outline-primary"
                    onClick={fetchProject}
                  >
                    🔄 Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const projectDuration = calculateProjectDuration();
  const projectProgress = getProjectProgress();

  return (
    <div className="container mt-4">
      {/* Header Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-lg">
            <div className="card-header bg-gradient" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
              <div className="row align-items-center text-white">
                <div className="col-md-8">
                  <h1 className="mb-1 fw-bold">🏗️ Project Details</h1>
                  <div className="d-flex flex-wrap align-items-center">
                    <span className="badge bg-light text-dark me-3 fs-6 px-3 py-2">
                      {project.pcode}
                    </span>
                    <span className="opacity-75 fs-6">{project.ptype}</span>
                  </div>
                </div>
                <div className="col-md-4 text-end">
                  <div className="btn-group">
                    <button 
                      className="btn btn-light btn-sm"
                      onClick={() => navigate(`/projects/${id}`)}
                      title="Edit Project"
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      className="btn btn-outline-light btn-sm"
                      onClick={() => navigate("/projects")}
                      title="Back to List"
                    >
                      ← Back
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Main Content */}
        <div className="col-lg-8">
          {/* Project Image */}
          <div className="card shadow-sm mb-4">
            <div className="card-body p-0">
              <div className="position-relative">
                <img
                  src={project.pimg || "https://via.placeholder.com/800x400?text=Project+Image"}
                  alt="Project"
                  className="img-fluid rounded w-100"
                  style={{ maxHeight: "400px", objectFit: "cover" }}
                />
                <div className="position-absolute top-0 end-0 m-3">
                  <span className={`badge ${getStatusBadgeClass(project.pstatus)} fs-6 px-3 py-2`}>
                    {project.pstatus}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Project Title & Basic Info */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h2 className="text-primary mb-3 fw-bold">{project.pname}</h2>
              
              {/* Status & Priority Badges */}
              <div className="mb-4">
                <span className={`badge ${getStatusBadgeClass(project.pstatus)} me-2 fs-6 px-3 py-2`}>
                  📊 {project.pstatus}
                </span>
                <span className={`badge ${getPriorityBadgeClass(project.ppriority)} me-2 fs-6 px-3 py-2`}>
                  🔥 {project.ppriority} Priority
                </span>
                <span className="badge bg-success fs-6 px-3 py-2">
                  💰 ${Number(project.pbudget || 0).toLocaleString()}
                </span>
              </div>

              {/* Project Progress */}
              {projectProgress > 0 && (
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-semibold text-muted">Project Progress</span>
                    <span className="badge bg-info">{projectProgress}%</span>
                  </div>
                  <div className="progress" style={{height: '8px'}}>
                    <div 
                      className="progress-bar bg-info" 
                      role="progressbar" 
                      style={{width: `${projectProgress}%`}}
                    ></div>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="mb-4">
                <h5 className="text-secondary mb-3">📝 Description</h5>
                <div className="p-3 bg-light bg-opacity-50 rounded border-start border-primary border-4">
                  {project.pdescription ? (
                    <p className="mb-0" style={{lineHeight: '1.6'}}>
                      {project.pdescription}
                    </p>
                  ) : (
                    <span className="text-muted fst-italic">No description provided.</span>
                  )}
                </div>
              </div>

              {/* Issues */}
              {project.pissues && (
                <div className="mb-4">
                  <h5 className="text-warning mb-3">⚠️ Issues</h5>
                  <div className="p-3 bg-warning bg-opacity-10 rounded border-start border-warning border-4">
                    <p className="mb-0" style={{lineHeight: '1.6'}}>
                      {project.pissues}
                    </p>
                  </div>
                </div>
              )}

              {/* Observations */}
              {project.pobservations && (
                <div className="mb-4">
                  <h5 className="text-info mb-3">👁️ Observations</h5>
                  <div className="p-3 bg-info bg-opacity-10 rounded border-start border-info border-4">
                    <p className="mb-0" style={{lineHeight: '1.6'}}>
                      {project.pobservations}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          {/* Owner Information */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">👤 Owner Information</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <div className="d-flex align-items-center mb-2">
                  <span className="text-muted me-2">👤</span>
                  <strong>{project.pownername}</strong>
                </div>
                <div className="d-flex align-items-center mb-2">
                  <span className="text-muted me-2">🆔</span>
                  <span className="font-monospace">{project.pownerid}</span>
                </div>
                <div className="d-flex align-items-center">
                  <span className="text-muted me-2">📞</span>
                  <a href={`tel:${project.potelnumber}`} className="text-decoration-none">
                    {project.potelnumber}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">📍 Location</h5>
            </div>
            <div className="card-body">
              <div className="d-flex align-items-center">
                <span className="text-muted me-2">🌍</span>
                <span>{project.plocation}</span>
              </div>
            </div>
          </div>

          {/* Project Timeline */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">⏱️ Timeline</h5>
            </div>
            <div className="card-body">
              <div className="timeline-item mb-3">
                <div className="d-flex align-items-center mb-1">
                  <span className="text-muted me-2">🚀</span>
                  <small className="text-muted">Created</small>
                </div>
                <div className="ms-4">
                  <strong>{formatDate(project.pcreatedat)}</strong>
                </div>
              </div>
              
              <div className="timeline-item mb-3">
                <div className="d-flex align-items-center mb-1">
                  <span className="text-muted me-2">🏁</span>
                  <small className="text-muted">End Date</small>
                </div>
                <div className="ms-4">
                  <strong>{formatDate(project.penddate)}</strong>
                </div>
              </div>

              <div className="timeline-item mb-3">
                <div className="d-flex align-items-center mb-1">
                  <span className="text-muted me-2">🔄</span>
                  <small className="text-muted">Last Updated</small>
                </div>
                <div className="ms-4">
                  <strong>{formatDate(project.pupdatedat)}</strong>
                </div>
              </div>

              {projectDuration && (
                <div className="mt-3 pt-3 border-top">
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Duration:</span>
                    <span className="badge bg-info">
                      {projectDuration} days
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-secondary text-white">
              <h5 className="mb-0">📊 Quick Stats</h5>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-12 mb-3">
                  <div className="p-3 bg-primary bg-opacity-10 rounded">
                    <div className="text-primary mb-1" style={{fontSize: '1.5rem'}}>💰</div>
                    <div className="fw-bold text-primary">
                      ${Number(project.pbudget || 0).toLocaleString()}
                    </div>
                    <small className="text-muted">Total Budget</small>
                  </div>
                </div>
                
                <div className="col-6">
                  <div className="p-3 bg-success bg-opacity-10 rounded">
                    <div className="text-success mb-1" style={{fontSize: '1.2rem'}}>🔥</div>
                    <div className="fw-bold text-success">{project.ppriority}</div>
                    <small className="text-muted">Priority</small>
                  </div>
                </div>
                
                <div className="col-6">
                  <div className="p-3 bg-info bg-opacity-10 rounded">
                    <div className="text-info mb-1" style={{fontSize: '1.2rem'}}>📋</div>
                    <div className="fw-bold text-info">{project.pstatus}</div>
                    <small className="text-muted">Status</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State for Missing Information */}
      {!project.pdescription && !project.pissues && !project.pobservations && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body text-center py-5">
                <div className="mb-3">
                  <span style={{fontSize: '4rem', opacity: 0.3}}>📋</span>
                </div>
                <h4 className="text-muted">Additional Information Missing</h4>
                <p className="text-muted">This project doesn't have description, issues, or observations recorded yet.</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate(`/update-project/${id}`)}
                >
                  ✏️ Add Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="row mt-4 mb-5">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body text-center py-4">
              <div className="btn-group" role="group">
                <button 
                  className="btn btn-primary btn-lg"
                  onClick={() => navigate(`/projects/${id}`)}
                >
                  ✏️ Edit Project
                </button>
                <button 
                  className="btn btn-outline-primary btn-lg"
                  onClick={() => navigate("/projects")}
                >
                  📋 All Projects
                </button>
                <button 
                  className="btn btn-outline-secondary btn-lg"
                  onClick={() => window.print()}
                >
                  🖨️ Print
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .btn, .card-header .btn, .btn-group {
            display: none !important;
          }
          .card {
            border: 1px solid #dee2e6 !important;
            box-shadow: none !important;
            break-inside: avoid;
          }
          .card-header {
            background-color: #f8f9fa !important;
            color: #495057 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          body {
            font-size: 12px !important;
          }
          .container {
            max-width: 100% !important;
            margin: 0 !important;
            padding: 10px !important;
          }
          h1 { font-size: 18px !important; }
          h2 { font-size: 16px !important; }
          h5 { font-size: 14px !important; }
          .badge {
            border: 1px solid #dee2e6 !important;
          }
          .timeline-item {
            margin-bottom: 10px !important;
          }
        }

        .timeline-item {
          position: relative;
        }

        .timeline-item::before {
          content: '';
          position: absolute;
          left: 10px;
          top: 25px;
          bottom: -15px;
          width: 2px;
          background-color: #e9ecef;
        }

        .timeline-item:last-child::before {
          display: none;
        }

        .bg-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
        }

        .progress {
          border-radius: 50px;
        }

        .progress-bar {
          border-radius: 50px;
        }
      `}</style>
    </div>
  );
}