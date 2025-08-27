import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function Projects({ project, onDelete }) {
  const [imageError, setImageError] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!project) {
    return (
      <div className="col-md-4 mb-4">
        <div className="card h-100 shadow-sm border-0">
          <div className="card-body d-flex align-items-center justify-content-center" style={{ minHeight: "300px" }}>
            <div className="text-center text-muted">
              <i className="fas fa-exclamation-triangle fa-3x mb-3"></i>
              <h5>No project data</h5>
              <p>This card requires a "project" prop.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const {
    _id,
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
    pcreatedat,
    pupdatedat,
    pbudget,
    pstatus,
    penddate,
    pissues,
    pobservations,
  } = project;

  // Status badge styling
  const getStatusBadge = (status) => {
    const statusMap = {
      "Planned": { class: "bg-secondary", icon: "fas fa-clock" },
      "In Progress": { class: "bg-warning text-dark", icon: "fas fa-spinner" },
      "Completed": { class: "bg-success", icon: "fas fa-check-circle" }
    };
    const statusInfo = statusMap[status] || { class: "bg-light text-dark", icon: "fas fa-question" };
    return (
      <span className={`badge ${statusInfo.class} d-flex align-items-center gap-1`}>
        <i className={statusInfo.icon}></i>
        {status}
      </span>
    );
  };

  // Priority badge styling
  const getPriorityBadge = (priority) => {
    const priorityMap = {
      "High": { class: "bg-danger", icon: "fas fa-exclamation" },
      "Medium": { class: "bg-warning text-dark", icon: "fas fa-minus" },
      "Low": { class: "bg-info", icon: "fas fa-arrow-down" }
    };
    const priorityInfo = priorityMap[priority] || { class: "bg-light text-dark", icon: "fas fa-question" };
    return (
      <span className={`badge ${priorityInfo.class} d-flex align-items-center gap-1`}>
        <i className={priorityInfo.icon}></i>
        {priority}
      </span>
    );
  };

  // Handle image error
  const handleImageError = () => {
    setImageError(true);
  };

  // Handle delete with loading state
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete project "${pname}"?`
    );
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      await axios.delete(`http://localhost:505      // ...existing code...
      <div className="col-md-6">
        <label htmlFor="ptype" className="form-label fw-semibold">
          Project Type <span className="text-danger">*</span>
        </label>
        <select
          id="ptype"
          name="ptype"
          className="form-select form-select-lg"
          value={formData.ptype}
          onChange={handleChange}
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
      // ...existing code...0/projects/${_id}`);
      if (onDelete) onDelete(_id);
    } catch (err) {
      console.error("Error deleting project:", err);
      alert("Failed to delete project. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Calculate project progress (days)
  const calculateProgress = () => {
    const startDate = new Date(pcreatedat);
    const endDate = new Date(penddate);
    const today = new Date();
    
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const elapsedDays = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24));
    const progress = Math.min(Math.max((elapsedDays / totalDays) * 100, 0), 100);
    
    return { progress: Math.round(progress), totalDays, elapsedDays };
  };

  const { progress } = calculateProgress();

  return (
    <div className="col-lg-4 col-md-6 mb-4">
      <div className="card h-100 shadow-lg border-0 position-relative overflow-hidden" style={{ transition: "transform 0.3s ease, box-shadow 0.3s ease" }}>
        {/* Hover effect */}
        <style jsx>{`
          .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(0,0,0,0.1) !important;
          }
        `}</style>

        {/* Project Image with Overlay */}
        <div className="position-relative" style={{ height: "200px", overflow: "hidden" }}>
          {!imageError && pimg ? (
            <img
              src={pimg}
              className="card-img-top w-100 h-100"
              alt={pname}
              onError={handleImageError}
              style={{ objectFit: "cover", transition: "transform 0.3s ease" }}
              onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
              onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
            />
          ) : (
            <div className="w-100 h-100 bg-gradient-primary d-flex align-items-center justify-content-center text-white">
              <div className="text-center">
                <i className="fas fa-image fa-3x opacity-50 mb-2"></i>
                <p className="mb-0 fw-bold">No Image Available</p>
              </div>
            </div>
          )}
          
          {/* Status & Priority Badges Overlay */}
          <div className="position-absolute top-0 start-0 p-2 d-flex flex-column gap-1">
            {getStatusBadge(pstatus)}
            {getPriorityBadge(ppriority)}
          </div>

          {/* Project Type Badge */}
          <div className="position-absolute top-0 end-0 p-2">
            <span className="badge bg-dark bg-opacity-75 text-white">
              <i className="fas fa-tag me-1"></i>
              {ptype}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="card-body p-3 d-flex flex-column">
          {/* Project Title and Code */}
          <div className="mb-2">
            <h5 className="card-title mb-1 fw-bold text-primary" style={{ fontSize: "1.1rem" }}>
              {pname}
            </h5>
            <div className="d-flex justify-content-between align-items-center">
              <small className="text-muted">
                <i className="fas fa-hashtag me-1"></i>
                {pnumber}
              </small>
              <small className="badge bg-light text-dark">
                {pcode}
              </small>
            </div>
          </div>

          {/* Project Info Grid */}
          <div className="row g-2 mb-3 flex-grow-1">
            <div className="col-12">
              <div className="d-flex align-items-center text-muted small">
                <i className="fas fa-map-marker-alt me-2 text-primary"></i>
                <span className="fw-semibold">Location:</span>
                <span className="ms-1">{plocation}</span>
              </div>
            </div>
            <div className="col-12">
              <div className="d-flex align-items-center text-muted small">
                <i className="fas fa-user me-2 text-primary"></i>
                <span className="fw-semibold">Owner:</span>
                <span className="ms-1">{pownername}</span>
              </div>

              <div className="col-12">
              <div className="d-flex align-items-center text-muted small">
                <i className="fas fa-phone me-2 text-primary"></i>
                <span className="fw-semibold">Owner ID:</span>
                <a href={`tel:${pownerid}`} className="ms-1 text-decoration-none">
                  {potelnumber}
                </a>
              </div>
            </div>
              
            </div>
            <div className="col-12">
              <div className="d-flex align-items-center text-muted small">
                <i className="fas fa-phone me-2 text-primary"></i>
                <span className="fw-semibold">Contact:</span>
                <a href={`tel:${potelnumber}`} className="ms-1 text-decoration-none">
                  {potelnumber}
                </a>
              </div>
            </div>
            <div className="col-12">
              <div className="d-flex align-items-center text-muted small">
                <i className="fas fa-dollar-sign me-2 text-primary"></i>
                <span className="fw-semibold">Budget:</span>
                <span className="ms-1 fw-bold text-success">
                  ${parseFloat(pbudget).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-3">
            <p className="card-text small text-muted mb-2" style={{ 
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden"
            }}>
              {pdescription}
            </p>
          </div>

          {/* Progress Bar */}
          {pstatus === "In Progress" && (
            <div className="mb-3">
              <div className="d-flex justify-content-between small text-muted mb-1">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="progress" style={{ height: "6px" }}>
                <div 
                  className="progress-bar bg-primary" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="row g-2 mb-3 small">
            <div className="col-6">
              <div className="text-muted">
                <i className="fas fa-calendar-plus me-1 text-success"></i>
                <strong>Start:</strong>
                <br />
                {new Date(pcreatedat).toLocaleDateString()}
              </div>
            </div>
            <div className="col-6">
              <div className="text-muted">
                <i className="fas fa-calendar-plus me-1 text-success"></i>
                <strong>Updated:</strong>
                <br />
                {new Date(pupdatedat).toLocaleDateString()}
              </div>
            </div>
            <div className="col-6">
              <div className="text-muted">
                <i className="fas fa-calendar-check me-1 text-danger"></i>
                <strong>End:</strong>
                <br />
                {new Date(penddate).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Issues (if any) */}
          {pissues && pissues.length > 0 && (
            <div className="mb-2">
              <div className="alert alert-warning py-2 px-3 small mb-0">
                <i className="fas fa-exclamation-triangle me-1"></i>
                <strong>Issues:</strong> {pissues.slice(0, 2).join(", ")}
                {pissues.length > 2 && <span className="text-muted"> (+{pissues.length - 2} more)</span>}
              </div>
            </div>
          )}

          {/* Observations (if any) */}
          {pobservations && (
            <div className="mb-2">
              <small className="text-muted">
                <i className="fas fa-eye me-1"></i>
                <strong>Notes:</strong> 
                <span style={{ 
                  display: "-webkit-box",
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden"
                }}>
                  {pobservations}
                </span>
              </small>
            </div>
          )}
        </div>

        {/* Card Footer with Action Buttons */}
        <div className="card-footer bg-light border-0 p-3">
          <div className="d-grid gap-2 d-md-flex justify-content-md-between">
            <Link 
              to={`/projects/${_id}`} 
              className="btn btn-outline-primary btn-sm flex-fill me-md-2"
              style={{ transition: "all 0.3s ease" }}
            >
              <i className="fas fa-edit me-1"></i>
              Edit Details
            </Link>
            <button 
              onClick={handleDelete} 
              className="btn btn-outline-danger btn-sm flex-fill"
              disabled={isDeleting}
              style={{ transition: "all 0.3s ease" }}
            >
              {isDeleting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1"></span>
                  Deleting...
                </>
              ) : (
                <>
                  <i className="fas fa-trash me-1"></i>
                  Delete
                </>
              )}
            </button>
          </div>
        </div>

        {/* Subtle Animation */}
        <div className="position-absolute bottom-0 start-0 w-100 bg-primary" style={{ height: "2px", opacity: "0.1" }}></div>
      </div>
    </div>
  );
}

export function ProjectsList({ projects, onDelete }) {
  return (
    <div className="container">
      <div className="row justify-content-center">
        {projects.map(project => (
          <Projects key={project._id} project={project} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}