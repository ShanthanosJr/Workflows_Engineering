import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

// Add this import at the top with other imports
import { exportProjectToPDF } from '../ExportUtils';

export default function ProjectsView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  // Get project images array or fallback to single image/default
  const getProjectImages = (project) => {
    if (!project) return [];

    if (project.pimg && Array.isArray(project.pimg) && project.pimg.length > 0) {
      return project.pimg;
    }

    if (project.pimg && typeof project.pimg === 'string') {
      return [project.pimg];
    }

    const defaultImages = {
      'Residential': 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=400&fit=crop&auto=format',
      'Commercial': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=400&fit=crop&auto=format',
      'Infrastructure': 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=800&h=400&fit=crop&auto=format',
      'Industrial': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=400&fit=crop&auto=format',
      default: 'https://via.placeholder.com/800x400?text=Project+Image'
    };

    return [defaultImages[project.ptype] || defaultImages.default];
  };

  // Auto-carousel effect (3 seconds) when auto-playing is enabled
  useEffect(() => {
    let intervalId;
    if (isAutoPlaying && project) {
      const projectImages = getProjectImages(project);
      if (projectImages.length > 1) {
        intervalId = setInterval(() => {
          setCurrentImageIndex((prevIndex) =>
            prevIndex === projectImages.length - 1 ? 0 : prevIndex + 1
          );
        }, 3000); // 3 second interval
      }
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAutoPlaying, project]);

  const handlePreviousImage = () => {
    const projectImages = getProjectImages(project);
    setCurrentImageIndex(currentImageIndex === 0 ? projectImages.length - 1 : currentImageIndex - 1);
  };

  const handleNextImage = () => {
    const projectImages = getProjectImages(project);
    setCurrentImageIndex(currentImageIndex === projectImages.length - 1 ? 0 : currentImageIndex + 1);
  };

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
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
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
                  <span style={{ fontSize: '4rem', color: '#dc3545' }}>⚠️</span>
                </div>
                <h4 className="card-title text-danger">Project Not Found</h4>
                <p className="card-text text-muted">
                  {error || "The requested project could not be found or may have been deleted."}
                </p>
                <div className="mt-4">
                  <button
                    className="btn btn-primary me-2"
                    onClick={() => navigate("/projects-fd")}
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
  const projectImages = getProjectImages(project);
  const hasMultipleImages = projectImages.length > 1;

  // Add this function after other helper functions
  const handleExportProject = () => {
    if (project) {
      exportProjectToPDF(project, `project-${project.pcode}-detailed.pdf`);
    }
  };

  return (
    <div style={{ backgroundColor: '#fdfcfb', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Premium Header */}
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
                  <i className="fas fa-building text-white fs-1"></i>
                </div>
                <div>
                  <h1 className="display-4 fw-bold mb-1" style={{
                    color: '#1a1a1a',
                    fontWeight: '700',
                    letterSpacing: '-0.02em'
                  }}>Project Overview</h1>
                  <p className="h5 text-muted mb-0" style={{ fontWeight: '300' }}>
                    {project.pname} • {project.ptype}
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
                Immerse in the blueprint of {project.pname}, where precision meets innovation in construction excellence.
              </p>
              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <button
                  className="btn btn-outline-primary btn-lg px-5 py-3 fw-semibold"
                  style={{
                    borderRadius: '50px',
                    border: '2px solid #d4af37',
                    color: '#d4af37',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(212, 175, 55, 0.2)'
                  }}
                  onClick={() => navigate(`/projects/${id}`)}
                >
                  <i className="fas fa-edit me-2"></i>Refine Blueprint
                </button>
                <button
                  className="btn btn-primary btn-lg px-5 py-3 fw-semibold"
                  style={{
                    borderRadius: '50px',
                    background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                    border: 'none',
                    color: '#fff',
                    fontWeight: '600',
                    boxShadow: '0 4px 20px rgba(212, 175, 55, 0.4)',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => navigate("/projects-fd")}
                >
                  <i className="fas fa-list me-2"></i>Project Portfolio
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mt-5 mb-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="row g-5">
              {/* Main Content */}
              <div className="col-lg-8">
                {/* Enhanced Project Image Carousel */}
                <div className="card border-0 shadow-xl" style={{
                  borderRadius: '24px',
                  overflow: 'hidden',
                  background: 'linear-gradient(145deg, #ffffff 0%, #fdfcfb 100%)',
                  boxShadow: '0 25px 80px rgba(0, 0, 0, 0.1), 0 1px 4px rgba(0, 0, 0, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <div className="position-relative p-0">
                    <div
                      className="position-relative"
                      onMouseEnter={() => setIsAutoPlaying(true)}
                      onMouseLeave={() => setIsAutoPlaying(false)}
                      style={{ height: '500px' }}
                    >
                      <img
                        src={projectImages[currentImageIndex]}
                        alt={`${project.pname} - ${currentImageIndex + 1}`}
                        className="img-fluid w-100 h-100"
                        style={{ objectFit: "cover" }}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/800x400?text=Project+Image';
                        }}
                      />

                      {/* Status Badge */}
                      <div className="position-absolute top-4 end-4">
                        <span className={`badge ${getStatusBadgeClass(project.pstatus)} fs-6 px-4 py-2 fw-semibold shadow-sm`} style={{
                          background: getStatusBadgeClass(project.pstatus).includes('success') ? 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' :
                            getStatusBadgeClass(project.pstatus).includes('warning') ? 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)' :
                              getStatusBadgeClass(project.pstatus).includes('danger') ? 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)' :
                                'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                          color: '#fff'
                        }}>
                          {project.pstatus.toUpperCase()}
                        </span>
                      </div>

                      {/* Navigation buttons for multiple images */}
                      {hasMultipleImages && (
                        <>
                          <button
                            className="btn position-absolute top-50 start-4 translate-middle-y"
                            onClick={handlePreviousImage}
                            style={{
                              width: '56px',
                              height: '56px',
                              borderRadius: '50%',
                              background: 'rgba(255, 255, 255, 0.9)',
                              color: '#374151',
                              border: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                              transition: 'all 0.3s ease',
                              zIndex: 2,
                              backdropFilter: 'blur(10px)'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = 'rgba(255, 255, 255, 1)';
                              e.target.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                              e.target.style.transform = 'scale(1)';
                            }}
                            title="Previous image"
                          >
                            <i className="fas fa-chevron-left"></i>
                          </button>
                          <button
                            className="btn position-absolute top-50 end-4 translate-middle-y"
                            onClick={handleNextImage}
                            style={{
                              width: '56px',
                              height: '56px',
                              borderRadius: '50%',
                              background: 'rgba(255, 255, 255, 0.9)',
                              color: '#374151',
                              border: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                              transition: 'all 0.3s ease',
                              zIndex: 2,
                              backdropFilter: 'blur(10px)'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = 'rgba(255, 255, 255, 1)';
                              e.target.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                              e.target.style.transform = 'scale(1)';
                            }}
                            title="Next image"
                          >
                            <i className="fas fa-chevron-right"></i>
                          </button>

                          {/* Image counter */}
                          <div className="position-absolute bottom-4 end-4">
                            <span
                              className="badge bg-dark bg-opacity-75 text-white fs-6 px-3 py-2 fw-semibold"
                              style={{ backdropFilter: 'blur(10px)' }}
                            >
                              {currentImageIndex + 1} / {projectImages.length}
                            </span>
                          </div>

                          {/* Image dots indicator */}
                          <div className="position-absolute bottom-4 start-50 translate-middle-x">
                            <div className="d-flex gap-2">
                              {projectImages.map((_, index) => (
                                <button
                                  key={index}
                                  className={`btn p-0 rounded-circle transition-all ${index === currentImageIndex ? 'bg-light' : 'bg-secondary bg-opacity-50'
                                    }`}
                                  style={{
                                    width: '12px',
                                    height: '12px',
                                    transition: 'all 0.3s ease'
                                  }}
                                  onClick={() => setCurrentImageIndex(index)}
                                  title={`Go to image ${index + 1}`}
                                >
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Auto-play indicator */}
                          {isAutoPlaying && (
                            <div className="position-absolute top-4 start-4">
                              <span className="badge bg-success bg-opacity-90 text-white fw-semibold px-3 py-2" style={{
                                background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                                backdropFilter: 'blur(10px)'
                              }}>
                                <i className="fas fa-play-circle me-1"></i>Auto-Play
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Enhanced Project Title & Basic Info */}
                <div className="card border-0 shadow-xl mb-5" style={{
                  borderRadius: '24px',
                  overflow: 'hidden',
                  background: 'linear-gradient(145deg, #ffffff 0%, #fdfcfb 100%)',
                  boxShadow: '0 25px 80px rgba(0, 0, 0, 0.1), 0 1px 4px rgba(0, 0, 0, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <div className="card-body p-5">
                    <h2 className="display-5 fw-bold mb-4" style={{ color: '#111827', letterSpacing: '-0.02em' }}>{project.pname}</h2>

                    {/* Status & Priority Badges */}
                    <div className="mb-5 d-flex flex-wrap gap-2">
                      <span className={`badge fs-6 px-4 py-3 fw-semibold shadow-sm`} style={{
                        background: `linear-gradient(135deg, ${getStatusBadgeClass(project.pstatus).includes('success') ? '#10b981' :
                          getStatusBadgeClass(project.pstatus).includes('warning') ? '#f59e0b' :
                            getStatusBadgeClass(project.pstatus).includes('danger') ? '#ef4444' : '#3b82f6'} 0%, ${getStatusBadgeClass(project.pstatus).includes('success') ? '#34d399' :
                              getStatusBadgeClass(project.pstatus).includes('warning') ? '#fbbf24' :
                                getStatusBadgeClass(project.pstatus).includes('danger') ? '#f87171' : '#60a5fa'} 100%)`,
                        color: '#fff',
                        borderRadius: '50px'
                      }}>
                        <i className="fas fa-chart-line me-1"></i>{project.pstatus.toUpperCase()}
                      </span>
                      <span className={`badge fs-6 px-4 py-3 fw-semibold shadow-sm`} style={{
                        background: `linear-gradient(135deg, ${getPriorityBadgeClass(project.ppriority).includes('danger') ? '#ef4444' :
                          getPriorityBadgeClass(project.ppriority).includes('warning') ? '#f59e0b' :
                            getPriorityBadgeClass(project.ppriority).includes('success') ? '#10b981' : '#6b7280'} 0%, ${getPriorityBadgeClass(project.ppriority).includes('danger') ? '#f87171' :
                              getPriorityBadgeClass(project.ppriority).includes('warning') ? '#fbbf24' :
                                getPriorityBadgeClass(project.ppriority).includes('success') ? '#34d399' : '#9ca3af'} 100%)`,
                        color: '#fff',
                        borderRadius: '50px'
                      }}>
                        <i className="fas fa-fire me-1"></i>{project.ppriority.toUpperCase()} PRIORITY
                      </span>
                      <span className="badge fs-6 px-4 py-3 fw-semibold bg-gradient text-white shadow-sm" style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                        borderRadius: '50px'
                      }}>
                        <i className="fas fa-dollar-sign me-1"></i>${Number(project.pbudget || 0).toLocaleString()}
                      </span>
                    </div>

                    {/* Project Progress */}
                    {projectProgress > 0 && (
                      <div className="mb-5">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span className="h6 fw-bold text-muted" style={{ color: '#6b7280' }}>Milestone Trajectory</span>
                          <span className="badge bg-info bg-opacity-90 fw-semibold px-3 py-2" style={{
                            background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                            color: '#fff'
                          }}>{projectProgress}%</span>
                        </div>
                        <div className="progress" style={{ height: '12px', borderRadius: '50px', backgroundColor: '#f3f4f6', overflow: 'hidden' }}>
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{
                              width: `${projectProgress}%`,
                              background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)',
                              borderRadius: '50px',
                              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                            }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    <div className="mb-5">
                      <h5 className="fw-bold mb-4" style={{
                        color: '#d4af37',
                        borderBottom: '3px solid #f8f7f4',
                        paddingBottom: '1rem',
                        fontSize: '1.25rem'
                      }}>
                        <i className="fas fa-file-alt me-3 text-muted fs-5"></i>Vision & Scope
                      </h5>
                      <div className="p-4 bg-gradient rounded-3 border-start border-primary border-4" style={{
                        background: 'linear-gradient(145deg, #faf9f6 0%, #f8f7f4 100%)',
                        borderColor: '#d4af37',
                        boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)'
                      }}>
                        {project.pdescription ? (
                          <p className="mb-0 fs-5" style={{ lineHeight: '1.7', color: '#374151' }}>
                            {project.pdescription}
                          </p>
                        ) : (
                          <span className="text-muted fst-italic fs-5">Awaiting narrative...</span>
                        )}
                      </div>

                      {/* Image Gallery Info */}
                      {hasMultipleImages && (
                        <div className="mt-4 p-3 bg-info bg-opacity-10 rounded-3 border border-info border-opacity-25">
                          <small className="text-info fw-semibold fs-6">
                            <i className="fas fa-images me-1"></i>{projectImages.length} visual assets integrated. Engage the carousel for immersive navigation.
                          </small>
                        </div>
                      )}
                    </div>

                    {/* Issues */}
                    {project.pissues && (
                      <div className="mb-5">
                        <h5 className="fw-bold mb-4" style={{
                          color: '#d4af37',
                          borderBottom: '3px solid #f8f7f4',
                          paddingBottom: '1rem',
                          fontSize: '1.25rem'
                        }}>
                          <i className="fas fa-exclamation-triangle me-3 text-warning fs-5"></i>Challenges & Mitigations
                        </h5>
                        <div className="p-4 bg-warning bg-opacity-10 rounded-3 border-start border-warning border-4" style={{
                          background: 'linear-gradient(145deg, #fffaf0 0%, #fef7e0 100%)',
                          borderColor: '#f59e0b',
                          boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)'
                        }}>
                          <p className="mb-0 fs-5" style={{ lineHeight: '1.7', color: '#92400e' }}>
                            {Array.isArray(project.pissues) ? project.pissues.join(', ') : project.pissues}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Observations */}
                    {project.pobservations && (
                      <div className="mb-5">
                        <h5 className="fw-bold mb-4" style={{
                          color: '#d4af37',
                          borderBottom: '3px solid #f8f7f4',
                          paddingBottom: '1rem',
                          fontSize: '1.25rem'
                        }}>
                          <i className="fas fa-eye me-3 text-info fs-5"></i>Insights & Annotations
                        </h5>
                        <div className="p-4 bg-info bg-opacity-10 rounded-3 border-start border-info border-4" style={{
                          background: 'linear-gradient(145deg, #f0f9ff 0%, #e0f2fe 100%)',
                          borderColor: '#0ea5e9',
                          boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)'
                        }}>
                          <p className="mb-0 fs-5" style={{ lineHeight: '1.7', color: '#0369a1' }}>
                            {project.pobservations}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Enhanced Sidebar */}
              <div className="col-lg-4">
                {/* Owner Information */}
                <div className="card border-0 shadow-xl mb-4" style={{
                  borderRadius: '24px',
                  overflow: 'hidden',
                  background: 'linear-gradient(145deg, #ffffff 0%, #fdfcfb 100%)',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <div className="card-header bg-gradient text-white p-4" style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                    border: 'none'
                  }}>
                    <h5 className="mb-0 fw-bold" style={{ color: '#fff' }}>
                      <i className="fas fa-user-tie me-2"></i>Stakeholder Profile
                    </h5>
                  </div>
                  <div className="card-body p-4">
                    <div className="mb-3 d-flex align-items-center p-3 bg-blue bg-opacity-10 rounded-3">
                      <div className="bg-primary bg-opacity-20 p-2 rounded-circle me-3" style={{ width: '40px', height: '40px' }}>
                        <i className="fas fa-user text-primary" style={{ fontSize: '1rem' }}></i>
                      </div>
                      <div>
                        <strong className="d-block fw-bold" style={{ color: '#1f2937' }}>{project.pownername}</strong>
                        <small className="text-muted">Primary Contact</small>
                      </div>
                    </div>
                    <div className="mb-3 d-flex align-items-center p-3 bg-gray bg-opacity-10 rounded-3">
                      <div className="bg-secondary bg-opacity-20 p-2 rounded-circle me-3" style={{ width: '40px', height: '40px' }}>
                        <i className="fas fa-id-card text-secondary" style={{ fontSize: '1rem' }}></i>
                      </div>
                      <div>
                        <strong className="d-block fw-bold font-monospace" style={{ color: '#1f2937' }}>{project.pownerid}</strong>
                        <small className="text-muted">Identifier</small>
                      </div>
                    </div>
                    {/* Phone row */}
                    <div className="d-flex align-items-center p-3 bg-green bg-opacity-10 rounded-3 mb-3">
                      <div className="bg-success bg-opacity-20 p-2 rounded-circle me-3" style={{ width: '40px', height: '40px' }}>
                        <i className="fas fa-phone text-success" style={{ fontSize: '1rem' }}></i>
                      </div>
                      <div>
                        <a href={`tel:${project.potelnumber}`} className="d-block fw-bold text-decoration-none" style={{ color: '#059669' }}>
                          {project.potelnumber}
                        </a>
                        <small className="text-muted">Direct Line</small>
                      </div>
                    </div>

                    {/* Email row */}
                    <div className="d-flex align-items-center p-3 bg-green bg-opacity-10 rounded-3 mb-3">
                      <div className="bg-success bg-opacity-20 p-2 rounded-circle me-3" style={{ width: '40px', height: '40px' }}>
                        <i className="fas fa-envelope text-success" style={{ fontSize: '1rem' }}></i>
                      </div>
                      <div>
                        <a href={`mailto:${project.powmail}`} className="d-block fw-bold text-decoration-none" style={{ color: '#059669' }}>
                          {project.powmail}
                        </a>
                        <small className="text-muted">Email</small>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Location */}
                <div className="card border-0 shadow-xl mb-4" style={{
                  borderRadius: '24px',
                  overflow: 'hidden',
                  background: 'linear-gradient(145deg, #ffffff 0%, #fdfcfb 100%)',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <div className="card-header bg-gradient text-white p-4" style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                    border: 'none'
                  }}>
                    <h5 className="mb-0 fw-bold" style={{ color: '#fff' }}>
                      <i className="fas fa-map-marker-alt me-2"></i>Site Coordinates
                    </h5>
                  </div>
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center p-3 bg-green bg-opacity-10 rounded-3">
                      <div className="bg-utility bg-opacity-20 p-2 rounded-circle me-3" style={{ width: '40px', height: '40px' }}>
                        <i className="fas fa-globe text-success" style={{ fontSize: '1rem' }}></i>
                      </div>
                      <div>
                        <strong className="d-block fw-bold" style={{ color: '#1f2937' }}>{project.plocation}</strong>
                        <small className="text-muted">Primary Site</small>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Project Timeline */}
                <div className="card border-0 shadow-xl mb-4" style={{
                  borderRadius: '24px',
                  overflow: 'hidden',
                  background: 'linear-gradient(145deg, #ffffff 0%, #fdfcfb 100%)',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <div className="card-header bg-gradient text-white p-4" style={{
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                    border: 'none'
                  }}>
                    <h5 className="mb-0 fw-bold" style={{ color: '#fff' }}>
                      <i className="fas fa-clock me-2"></i>Chronology
                    </h5>
                  </div>
                  <div className="card-body p-4">
                    <div className="timeline-item mb-4 position-relative">
                      <div className="d-flex align-items-start p-3 bg-purple bg-opacity-10 rounded-3">
                        <div className="bg-primary bg-opacity-20 p-2 rounded-circle me-3 mt-1" style={{ width: '32px', height: '32px' }}>
                          <i className="fas fa-rocket text-primary fs-6"></i>
                        </div>
                        <div className="flex-grow-1">
                          <small className="text-muted d-block">Initiation</small>
                          <strong className="d-block fw-bold" style={{ color: '#1f2937' }}>{formatDate(project.pcreatedat)}</strong>
                        </div>
                      </div>
                      <div className="position-absolute start-2 top-50 w-px h-50 bg-purple bg-opacity-20" style={{ transform: 'translateY(-50%)' }}></div>
                    </div>

                    <div className="timeline-item mb-4 position-relative">
                      <div className="d-flex align-items-start p-3 bg-purple bg-opacity-10 rounded-3">
                        <div className="bg-info bg-opacity-20 p-2 rounded-circle me-3 mt-1" style={{ width: '32px', height: '32px' }}>
                          <i className="fas fa-flag-checkered text-info fs-6"></i>
                        </div>
                        <div className="flex-grow-1">
                          <small className="text-muted d-block">Horizon</small>
                          <strong className="d-block fw-bold" style={{ color: '#1f2937' }}>{formatDate(project.penddate)}</strong>
                        </div>
                      </div>
                      <div className="position-absolute start-2 top-50 w-px h-50 bg-purple bg-opacity-20" style={{ transform: 'translateY(-50%)' }}></div>
                    </div>

                    <div className="timeline-item position-relative">
                      <div className="d-flex align-items-start p-3 bg-purple bg-opacity-10 rounded-3">
                        <div className="bg-warning bg-opacity-20 p-2 rounded-circle me-3 mt-1" style={{ width: '32px', height: '32px' }}>
                          <i className="fas fa-sync-alt text-warning fs-6"></i>
                        </div>
                        <div className="flex-grow-1">
                          <small className="text-muted d-block">Last Sync</small>
                          <strong className="d-block fw-bold" style={{ color: '#1f2937' }}>{formatDate(project.pupdatedat)}</strong>
                        </div>
                      </div>
                    </div>

                    {projectDuration && (
                      <div className="mt-4 pt-4 border-top border-purple border-opacity-20">
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="text-muted fw-semibold">Temporal Span:</span>
                          <span className="badge bg-gradient fw-semibold px-3 py-2" style={{
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                            color: '#fff'
                          }}>
                            {projectDuration} days
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="card border-0 shadow-xl mb-4" style={{
                  borderRadius: '24px',
                  overflow: 'hidden',
                  background: 'linear-gradient(145deg, #ffffff 0%, #fdfcfb 100%)',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <div className="card-header bg-gradient text-white p-4" style={{
                    background: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
                    border: 'none'
                  }}>
                    <h5 className="mb-0 fw-bold" style={{ color: '#fff' }}>
                      <i className="fas fa-chart-bar me-2"></i>Key Metrics
                    </h5>
                  </div>
                  <div className="card-body p-4">
                    <div className="row text-center g-3">
                      <div className="col-12">
                        <div className="p-4 bg-gradient rounded-3 shadow-sm" style={{
                          background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                          color: '#fff'
                        }}>
                          <div className="fs-1 mb-2"><i className="fas fa-dollar-sign"></i></div>
                          <div className="fw-bold fs-4">${Number(project.pbudget || 0).toLocaleString()}</div>
                          <small>Financial Allocation</small>
                        </div>
                      </div>

                      <div className="col-6">
                        <div className="p-4 bg-gradient rounded-3 shadow-sm" style={{
                          background: `linear-gradient(135deg, ${getPriorityBadgeClass(project.ppriority).includes('danger') ? '#ef4444' :
                            getPriorityBadgeClass(project.ppriority).includes('warning') ? '#f59e0b' : '#10b981'} 0%, ${getPriorityBadgeClass(project.ppriority).includes('danger') ? '#f87171' :
                              getPriorityBadgeClass(project.ppriority).includes('warning') ? '#fbbf24' : '#34d399'} 100%)`,
                          color: '#fff'
                        }}>
                          <div className="fs-2 mb-2"><i className="fas fa-fire"></i></div>
                          <div className="fw-bold">{project.ppriority.toUpperCase()}</div>
                          <small>Urgency Level</small>
                        </div>
                      </div>

                      <div className="col-6">
                        <div className="p-4 bg-gradient rounded-3 shadow-sm" style={{
                          background: `linear-gradient(135deg, ${getStatusBadgeClass(project.pstatus).includes('success') ? '#10b981' :
                            getStatusBadgeClass(project.pstatus).includes('warning') ? '#f59e0b' :
                              getStatusBadgeClass(project.pstatus).includes('danger') ? '#ef4444' : '#3b82f6'} 0%, ${getStatusBadgeClass(project.pstatus).includes('success') ? '#34d399' :
                                getStatusBadgeClass(project.pstatus).includes('warning') ? '#fbbf24' :
                                  getStatusBadgeClass(project.pstatus).includes('danger') ? '#f87171' : '#60a5fa'} 100%)`,
                          color: '#fff'
                        }}>
                          <div className="fs-2 mb-2"><i className="fas fa-tasks"></i></div>
                          <div className="fw-bold">{project.pstatus.toUpperCase()}</div>
                          <small>Current Phase</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State for Missing Information */}
        {!project.pdescription && !project.pissues && !project.pobservations && (
          <div className="row mt-5">
            <div className="col-12">
              <div className="card border-0 shadow-xl text-center py-5" style={{
                borderRadius: '24px',
                background: 'linear-gradient(145deg, #ffffff 0%, #fdfcfb 100%)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <div className="mb-4">
                  <span style={{ fontSize: '6rem', opacity: 0.1, color: '#d1d5db' }}><i className="fas fa-clipboard-list"></i></span>
                </div>
                <h4 className="text-muted fw-bold mb-3">Narrative Elements Pending</h4>
                <p className="text-muted fs-5 mb-4">Enhance this blueprint with descriptions, challenges, and insights for comprehensive oversight.</p>
                <button
                  className="btn btn-primary btn-lg px-5 py-3 fw-semibold"
                  style={{
                    borderRadius: '50px',
                    background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                    border: 'none',
                    color: '#fff',
                    boxShadow: '0 8px 25px rgba(212, 175, 55, 0.4)'
                  }}
                  onClick={() => navigate(`/update-project/${id}`)}
                >
                  <i className="fas fa-edit me-2"></i>Enrich Details
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Action Footer */}
        <div className="row mt-5 mb-5">
          <div className="col-12">
            <div className="card border-0 shadow-xl" style={{
              borderRadius: '24px',
              overflow: 'hidden',
              background: 'linear-gradient(145deg, #ffffff 0%, #fdfcfb 100%)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div className="card-body text-center py-5">
                <div className="btn-group gap-3" role="group">
                  <button
                    className="btn btn-lg px-6 py-4 fw-semibold"
                    style={{
                      borderRadius: '50px',
                      background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                      border: 'none',
                      color: '#fff',
                      fontSize: '1.1rem',
                      boxShadow: '0 8px 25px rgba(212, 175, 55, 0.4)',
                      minWidth: '200px'
                    }}
                    onClick={() => navigate(`/projects/${id}`)}
                  >
                    <i className="fas fa-edit me-2"></i>Refine Blueprint
                  </button>
                  <button
                    className="btn btn-outline-primary btn-lg px-6 py-4 fw-semibold"
                    style={{
                      borderRadius: '50px',
                      border: '2px solid #d4af37',
                      color: '#d4af37',
                      fontSize: '1.1rem',
                      boxShadow: '0 4px 15px rgba(212, 175, 55, 0.2)',
                      minWidth: '200px',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => navigate("/projects-fd")}
                  >
                    <i className="fas fa-th-list me-2"></i>Project Portfolio
                  </button>
                  <button
                    className="btn btn-outline-success btn-lg px-6 py-4 fw-semibold"
                    style={{
                      borderRadius: '50px',
                      border: '2px solid #198754',
                      color: '#198754',
                      fontSize: '1.1rem',
                      boxShadow: '0 4px 15px rgba(25, 135, 84, 0.2)',
                      minWidth: '150px',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={handleExportProject}
                  >
                    <i className="fas fa-file-export me-2"></i>Export PDF
                  </button>
                  <button
                    className="btn btn-outline-secondary btn-lg px-6 py-4 fw-semibold"
                    style={{
                      borderRadius: '50px',
                      border: '2px solid #6b7280',
                      color: '#6b7280',
                      fontSize: '1.1rem',
                      boxShadow: '0 4px 15px rgba(107, 114, 128, 0.2)',
                      minWidth: '150px',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => window.print()}
                  >
                    <i className="fas fa-print me-2"></i>Print View
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Print Styles */}
        <style jsx>{`
          @media print {
            .btn, .card-header .btn, .btn-group {
              display: none !important;
            }
            .card {
              border: 1px solid #dee2e6 !important;
              box-shadow: none !important;
              break-inside: avoid;
              border-radius: 0 !important;
            }
            .card-header {
              background-color: #f8f9fa !important;
              color: #495057 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            body {
              font-size: 12px !important;
              background: white !important;
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
              background: #f8f9fa !important;
              color: #495057 !important;
            }
            .timeline-item {
              margin-bottom: 10px !important;
            }
            .progress {
              height: 8px !important;
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
            background: linear-gradient(to bottom, #e5e7eb, #d1d5db);
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

          .bg-blue { background-color: #eff6ff; }
          .bg-gray { background-color: #f9fafb; }
          .bg-green { background-color: #f0fdf4; }
          .bg-purple { background-color: #faf5ff; }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .card {
            animation: fadeInUp 0.6s ease-out;
          }
        `}</style>
      </div>
    </div>
  );
}