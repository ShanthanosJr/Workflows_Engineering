import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function Projects({ project, onDelete }) {
  const [imageError, setImageError] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [, setIsHovered] = useState(false);

  if (!project) {
    return (
      <div className="col-md-4 mb-4">
        <div className="card h-100 border-0 shadow-lg rounded-4 overflow-hidden">
          <div className="card-body d-flex align-items-center justify-content-center" style={{ minHeight: "300px" }}>
            <div className="text-center text-muted">
              <div className="mb-3">
                <i className="fas fa-exclamation-triangle fa-4x opacity-25"></i>
              </div>
              <h5 className="fw-bold">No Project Data</h5>
              <p className="small opacity-75">This card requires a "project" prop.</p>
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
    //pownerid,
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

  // Enhanced status badge styling with modern gradients
  const getStatusBadge = (status) => {
    const statusMap = {
      "Planned": { 
        class: "bg-gradient text-white shadow-sm", 
        icon: "fas fa-clock",
        style: { background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }
      },
      "In Progress": { 
        class: "bg-gradient text-white shadow-sm", 
        icon: "fas fa-spinner fa-spin",
        style: { background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" }
      },
      "Completed": { 
        class: "bg-gradient text-white shadow-sm", 
        icon: "fas fa-check-circle",
        style: { background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" }
      }
    };
    const statusInfo = statusMap[status] || { 
      class: "bg-light text-dark shadow-sm", 
      icon: "fas fa-question",
      style: {}
    };
    return (
      <span 
        className={`badge ${statusInfo.class} d-flex align-items-center gap-1 px-3 py-2 rounded-pill`}
        style={{ 
          fontSize: "0.75rem", 
          fontWeight: "600",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.2)",
          ...statusInfo.style 
        }}
      >
        <i className={statusInfo.icon}></i>
        {status}
      </span>
    );
  };

  // Enhanced priority badge styling
  const getPriorityBadge = (priority) => {
    const priorityMap = {
      "High": { 
        class: "text-white shadow-sm", 
        icon: "fas fa-fire",
        style: { background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)" }
      },
      "Medium": { 
        class: "text-white shadow-sm", 
        icon: "fas fa-minus",
        style: { background: "linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)" }
      },
      "Low": { 
        class: "text-white shadow-sm", 
        icon: "fas fa-leaf",
        style: { background: "linear-gradient(135deg, #48dbfb 0%, #0abde3 100%)" }
      }
    };
    const priorityInfo = priorityMap[priority] || { 
      class: "bg-light text-dark shadow-sm", 
      icon: "fas fa-question",
      style: {}
    };
    return (
      <span 
        className={`badge ${priorityInfo.class} d-flex align-items-center gap-1 px-3 py-2 rounded-pill`}
        style={{ 
          fontSize: "0.75rem", 
          fontWeight: "600",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.2)",
          ...priorityInfo.style 
        }}
      >
        <i className={priorityInfo.icon}></i>
        {priority}
      </span>
    );
  };

  // Project type icons mapping
  const getProjectTypeIcon = (type) => {
    const typeIcons = {
      "Residential": "🏠",
      "Commercial": "🏢",
      "Industrial": "🏭",
      "Infrastructure": "🛣️",
      "Institutional": "🏫",
      "Renovation": "🔨",
      "Landscaping": "🌳",
      "Mixed-Use": "🏙️"
    };
    return typeIcons[type] || "🏗️";
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete project "${pname}"?`
    );
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      await axios.delete(`http://localhost:5050/projects/${_id}`);
      if (onDelete) onDelete(_id);
    } catch (err) {
      console.error("Error deleting project:", err);
      alert("Failed to delete project. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

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
    <>
      <style jsx>{`
        .project-card {
          transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .project-card:hover {
          transform: translateY(-12px) scale(1.02);
          box-shadow: 0 25px 50px rgba(0,0,0,0.15) !important;
        }
        
        .project-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
          border-radius: inherit;
          z-index: -1;
        }
        
        .project-card:hover::before {
          opacity: 1;
        }
        
        .image-container {
          position: relative;
          overflow: hidden;
          border-radius: 1rem 1rem 0 0;
        }
        
        .project-image {
          transition: all 0.4s ease;
          filter: brightness(0.9);
        }
        
        .project-card:hover .project-image {
          transform: scale(1.1);
          filter: brightness(1.1);
        }
        
        .glass-overlay {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .info-row {
          transition: all 0.3s ease;
          padding: 8px 12px;
          border-radius: 8px;
          margin: 2px 0;
        }
        
        .info-row:hover {
          background: rgba(102, 126, 234, 0.05);
          transform: translateX(5px);
        }
        
        .progress-glow {
          box-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
        }
        
        .action-btn {
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          border: 2px solid transparent;
          position: relative;
          overflow: hidden;
        }
        
        .action-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.5s;
        }
        
        .action-btn:hover::before {
          left: 100%;
        }
        
        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        .pulse-animation {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(102, 126, 234, 0); }
          100% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0); }
        }
        
        .floating-icon {
          animation: float 3s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .gradient-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      <div className="col-lg-4 col-md-6 mb-4">
        <div 
          className="card h-100 border-0 project-card rounded-4 position-relative overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Modern Image Section with Overlay */}
          <div className="image-container position-relative" style={{ height: "220px" }}>
            {!imageError && pimg ? (
              <img
                src={pimg}
                className="card-img-top w-100 h-100 project-image"
                alt={pname}
                onError={handleImageError}
                style={{ objectFit: "cover" }}
              />
            ) : (
              <div className="w-100 h-100 d-flex align-items-center justify-content-center text-white position-relative">
                <div 
                  className="position-absolute w-100 h-100"
                  style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    opacity: 0.9
                  }}
                ></div>
                <div className="text-center position-relative z-1">
                  <div className="floating-icon mb-3">
                    <span style={{ fontSize: "4rem" }}>{getProjectTypeIcon(ptype)}</span>
                  </div>
                  <p className="mb-0 fw-bold">No Image Available</p>
                </div>
              </div>
            )}
            
            {/* Floating Status & Priority Badges */}
            <div className="position-absolute top-0 start-0 p-3 d-flex flex-column gap-2">
              {getStatusBadge(pstatus)}
              {getPriorityBadge(ppriority)}
            </div>

            {/* Project Type Badge */}
            <div className="position-absolute top-0 end-0 p-3">
              <span className="badge glass-overlay text-white px-3 py-2 rounded-pill">
                <span className="me-2">{getProjectTypeIcon(ptype)}</span>
                {ptype}
              </span>
            </div>

            {/* Gradient Overlay */}
            <div 
              className="position-absolute bottom-0 w-100" 
              style={{
                height: "50px",
                background: "linear-gradient(to top, rgba(0,0,0,0.3), transparent)"
              }}
            ></div>
          </div>

          {/* Modern Card Body */}
          <div className="card-body p-4 d-flex flex-column">
            {/* Project Header */}
            <div className="mb-3">
              <h5 className="card-title mb-2 fw-bold gradient-text" style={{ fontSize: "1.25rem" }}>
                {pname}
              </h5>
              <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted d-flex align-items-center">
                  <i className="fas fa-hashtag me-2 text-primary"></i>
                  <span className="fw-semibold">{pnumber}</span>
                </small>
                <span className="badge bg-light text-dark border px-3 py-1 rounded-pill">
                  <i className="fas fa-code me-1"></i>
                  {pcode}
                </span>
              </div>
            </div>

            {/* Enhanced Info Grid */}
            <div className="mb-3 flex-grow-1">
              <div className="info-row d-flex align-items-center">
                <div className="flex-shrink-0 me-3">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{ 
                      width: "35px", 
                      height: "35px", 
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
                    }}
                  >
                    <i className="fas fa-map-marker-alt text-white small"></i>
                  </div>
                </div>
                <div className="flex-grow-1">
                  <div className="fw-semibold text-dark small">Location</div>
                  <div className="text-muted small">{plocation}</div>
                </div>
              </div>

              <div className="info-row d-flex align-items-center">
                <div className="flex-shrink-0 me-3">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{ 
                      width: "35px", 
                      height: "35px", 
                      background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" 
                    }}
                  >
                    <i className="fas fa-user text-white small"></i>
                  </div>
                </div>
                <div className="flex-grow-1">
                  <div className="fw-semibold text-dark small">Owner</div>
                  <div className="text-muted small">{pownername}</div>
                </div>
              </div>

              <div className="info-row d-flex align-items-center">
                <div className="flex-shrink-0 me-3">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{ 
                      width: "35px", 
                      height: "35px", 
                      background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" 
                    }}
                  >
                    <i className="fas fa-phone text-white small"></i>
                  </div>
                </div>
                <div className="flex-grow-1">
                  <div className="fw-semibold text-dark small">Contact</div>
                  <a href={`tel:${potelnumber}`} className="text-decoration-none text-primary small fw-medium">
                    {potelnumber}
                  </a>
                </div>
              </div>

              <div className="info-row d-flex align-items-center">
                <div className="flex-shrink-0 me-3">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{ 
                      width: "35px", 
                      height: "35px", 
                      background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)" 
                    }}
                  >
                    <i className="fas fa-dollar-sign text-white small"></i>
                  </div>
                </div>
                <div className="flex-grow-1">
                  <div className="fw-semibold text-dark small">Budget</div>
                  <div className="fw-bold text-success small">
                    ${parseFloat(pbudget).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Description */}
            <div className="mb-3">
              <div className="p-3 rounded-3 glass-overlay">
                <p className="card-text small text-dark mb-0 lh-base" style={{ 
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden"
                }}>
                  <i className="fas fa-quote-left text-primary opacity-50 me-2"></i>
                  {pdescription}
                </p>
              </div>
            </div>

            {/* Enhanced Progress Bar */}
            {pstatus === "In Progress" && (
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="small fw-semibold text-dark">Project Progress</span>
                  <span className="badge bg-primary px-2 py-1 rounded-pill small">{progress}%</span>
                </div>
                <div className="progress rounded-pill overflow-hidden" style={{ height: "8px" }}>
                  <div 
                    className={`progress-bar rounded-pill ${progress > 75 ? 'progress-glow' : ''}`}
                    style={{ 
                      width: `${progress}%`,
                      background: progress > 75 
                        ? "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                        : progress > 50 
                        ? "linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)"
                        : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    }}
                  ></div>
                </div>
              </div>
            )}

            {/* Enhanced Date Grid */}
            <div className="row g-2 mb-3 small">
              <div className="col-4">
                <div className="text-center p-2 rounded-3 glass-overlay">
                  <i className="fas fa-calendar-plus text-success mb-1 d-block"></i>
                  <div className="fw-bold text-dark" style={{ fontSize: "0.7rem" }}>START</div>
                  <div className="text-muted" style={{ fontSize: "0.7rem" }}>
                    {new Date(pcreatedat).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="col-4">
                <div className="text-center p-2 rounded-3 glass-overlay">
                  <i className="fas fa-sync text-warning mb-1 d-block"></i>
                  <div className="fw-bold text-dark" style={{ fontSize: "0.7rem" }}>UPDATED</div>
                  <div className="text-muted" style={{ fontSize: "0.7rem" }}>
                    {new Date(pupdatedat).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="col-4">
                <div className="text-center p-2 rounded-3 glass-overlay">
                  <i className="fas fa-calendar-check text-danger mb-1 d-block"></i>
                  <div className="fw-bold text-dark" style={{ fontSize: "0.7rem" }}>END</div>
                  <div className="text-muted" style={{ fontSize: "0.7rem" }}>
                    {new Date(penddate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Issues Alert */}
            {pissues && pissues.length > 0 && (
              <div className="mb-3">
                <div className="alert alert-warning border-0 py-2 px-3 small mb-0 rounded-3">
                  <i className="fas fa-exclamation-triangle text-warning me-2"></i>
                  <strong>Issues:</strong> {pissues.slice(0, 2).join(", ")}
                  {pissues.length > 2 && <span className="text-muted"> (+{pissues.length - 2} more)</span>}
                </div>
              </div>
            )}

            {/* Observations */}
            {pobservations && (
              <div className="mb-3">
                <div className="p-3 rounded-3" style={{ background: "rgba(102, 126, 234, 0.05)" }}>
                  <div className="small">
                    <i className="fas fa-eye text-primary me-2"></i>
                    <span className="fw-semibold text-dark">Notes:</span>
                  </div>
                  <div className="small text-muted mt-1" style={{ 
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden"
                  }}>
                    {pobservations}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modern Action Buttons */}
          <div className="card-footer border-0 p-4" style={{ background: "rgba(248, 249, 250, 0.8)" }}>
            <div className="d-grid gap-2">
              <div className="row g-2">
                <div className="col-12">
                  <Link 
                    to={`/project-view/${_id}`} 
                    className="btn btn-outline-primary action-btn w-100 rounded-pill py-2 fw-semibold"
                    style={{ 
                      border: "2px solid #667eea",
                      color: "#667eea"
                    }}
                  >
                    <i className="fas fa-eye me-2"></i>
                    View Details
                  </Link>
                </div>
                <div className="col-6">
                  <Link 
                    to={`/projects/${_id}`} 
                    className="btn btn-primary action-btn w-100 rounded-pill py-2 fw-semibold"
                    style={{ 
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      border: "none"
                    }}
                  >
                    <i className="fas fa-edit me-1"></i>
                    Edit
                  </Link>
                </div>
                <div className="col-6">
                  <button 
                    onClick={handleDelete} 
                    className={`btn btn-outline-danger action-btn w-100 rounded-pill py-2 fw-semibold ${isDeleting ? 'pulse-animation' : ''}`}
                    disabled={isDeleting}
                    style={{ border: "2px solid #dc3545" }}
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function ProjectsList({ projects, onDelete }) {
  return (
    <div className="container-fluid px-4">
      <div className="row justify-content-center">
        {projects.map(project => (
          <Projects key={project._id} project={project} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}