import React, { useState, useEffect } from "react";
import "./UserProjects.css";
import axios from "axios";
import NavV2 from "../Nav/NavV2";

const UserProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get("http://localhost:5050/projects");
        const projectData = Array.isArray(response.data) ? response.data : (response.data?.projects ?? []);
        setProjects(projectData);
      } catch (error) {
        console.error("Error fetching projects:", error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Filter projects based on search and filters
  const filteredProjects = projects.filter(project => {
    const matchesSearch = (
      (project.pname && project.pname.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (project.plocation && project.plocation.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (project.pdescription && project.pdescription.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const matchesStatus = statusFilter === "All" || project.pstatus === statusFilter;
    const matchesType = typeFilter === "All" || project.ptype === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Get unique values for filters
  const uniqueStatuses = [...new Set(projects.map(p => p.pstatus).filter(Boolean))];
  const uniqueTypes = [...new Set(projects.map(p => p.ptype).filter(Boolean))];

  const handleViewProject = (project) => {
    setSelectedProject(project);
    setCurrentImageIndex(0);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProject(null);
  };

  const nextImage = () => {
    if (selectedProject && selectedProject.pimg && selectedProject.pimg.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % selectedProject.pimg.length);
    }
  };

  const prevImage = () => {
    if (selectedProject && selectedProject.pimg && selectedProject.pimg.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + selectedProject.pimg.length) % selectedProject.pimg.length);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    const colors = {
      'In Progress': 'status-progress',
      'Completed': 'status-completed',
      'On Hold': 'status-hold',
      'Cancelled': 'status-cancelled',
      'Planning': 'status-planning'
    };
    return colors[status] || 'status-default';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'High': 'priority-high',
      'Medium': 'priority-medium',
      'Low': 'priority-low'
    };
    return colors[priority] || 'priority-default';
  };

  const getProjectImage = (project) => {
    if (project.pimg && project.pimg.length > 0) {
      return project.pimg[0];
    }
    
    // Default construction images based on type
    const defaultImages = {
      'Residential': 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'Commercial': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'Infrastructure': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'Industrial': 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    };
    
    return defaultImages[project.ptype] || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
  };

  return (
    <div className="premium-projects-container">
        <NavV2 />
      {/* Premium Navigation 
      <nav className="premium-navbar">
        <div className="premium-nav-content">
          <div className="premium-nav-brand">
            <div className="premium-brand-icon">🏗️</div>
            <h1 className="premium-brand-title">BuildCraft Solutions</h1>
          </div>
          <div className="premium-nav-links">
            <a href="#home" className="premium-nav-link">Home</a>
            <a href="#projects" className="premium-nav-link">Projects</a>
            <a href="#about" className="premium-nav-link">About</a>
            <a href="#contact" className="premium-nav-link">Contact</a>
            <div className="premium-nav-actions">
              <button className="premium-notification-btn">
                <span className="premium-bell-icon">🔔</span>
                <span className="premium-notification-badge">3</span>
              </button>
              <button className="premium-profile-btn">👤</button>
            </div>
          </div>
          <button className="premium-mobile-menu">☰</button>
        </div>
      </nav>*/}

      {/* Premium Hero Section */}
      <section className="premium-hero" id="home">
        <div className="premium-hero-video">
          <video autoPlay loop muted playsInline>
            <source src="https://www.pexels.com/download/video/3971351/" type="video/mp4" />
          </video>
          <div className="premium-hero-overlay"></div>
        </div>
        <div className="premium-hero-content">
          <h1 className="premium-hero-title">Workflows Construction Projects</h1>
          <p className="premium-hero-subtitle">Building Excellence Since 2025</p><br></br>
          <div className="premium-hero-actions">
           {/* <button className="premium-btn premium-btn-primary">View Our Projects</button>*/}
            <button className="premium-btn premium-btn-secondary">Watch Demo</button>
          </div>
        </div>
        <div className="premium-scroll-indicator">
          <span className="premium-scroll-arrow">↓</span>
        </div>
      </section>

      {/* Premium Expertise Section */}
      <section className="premium-expertise">
        <div className="premium-container">
          <div className="premium-section-header">
            <h2 className="premium-section-title">Our Expertise</h2>
            <p className="premium-section-subtitle">From residential homes to commercial complexes, we deliver excellence in every project type.</p>
          </div>
          <div className="premium-expertise-grid">
            <div className="premium-expertise-card residential">
              <div className="premium-expertise-image">
                <img src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Residential" />
              </div>
              <h3 className="premium-expertise-title">Residential</h3>
              <p className="premium-expertise-description">Custom homes and residential complexes built with precision and care for modern living.</p>
              <span className="premium-expertise-badge">250+ Projects</span>
            </div>
            
            <div className="premium-expertise-card commercial">
              <div className="premium-expertise-image">
                <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Commercial" />
              </div>
              <h3 className="premium-expertise-title">Commercial</h3>
              <p className="premium-expertise-description">Office buildings, retail spaces, and commercial complexes designed for business success.</p>
              <span className="premium-expertise-badge">180+ Projects</span>
            </div>
            
            <div className="premium-expertise-card infrastructure">
              <div className="premium-expertise-image">
                <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Infrastructure" />
              </div>
              <h3 className="premium-expertise-title">Infrastructure</h3>
              <p className="premium-expertise-description">Roads, bridges, and infrastructure projects that shape communities and cities.</p>
              <span className="premium-expertise-badge">95+ Projects</span>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Projects Section */}
      <section className="premium-projects" id="projects">
        <div className="premium-container">
          <div className="premium-section-header">
            <h2 className="premium-section-title">Latest Construction Projects</h2>
            <p className="premium-section-subtitle">Discover our recent works and ongoing developments across various sectors.</p>
          </div>
          
          {/* Premium Search and Filters */}
          <div className="premium-filters">
            <div className="premium-search-box">
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="premium-search-input"
              />
              <span className="premium-search-icon">🔍</span>
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="premium-filter-select"
            >
              <option value="All">All Status</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="premium-filter-select"
            >
              <option value="All">All Types</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Premium Projects Grid */}
          {loading ? (
            <div className="premium-loading">
              <div className="premium-spinner"></div>
              <p>Loading projects...</p>
            </div>
          ) : (
            <div className="premium-projects-grid">
              {filteredProjects.map((project) => (
                <div key={project._id} className="premium-project-card">
                  <div className="premium-project-image">
                    <img src={getProjectImage(project)} alt={project.pname} />
                    <div className="premium-project-badges">
                      <span className={`premium-status-badge ${getStatusColor(project.pstatus)}`}>
                        {project.pstatus}
                      </span>
                      {project.ppriority && (
                        <div className={`premium-priority-dot ${getPriorityColor(project.ppriority)}`} title={`${project.ppriority} Priority`}></div>
                      )}
                    </div>
                    <div className="premium-project-overlay">
                      <button
                        onClick={() => handleViewProject(project)}
                        className="premium-view-btn"
                      >
                        👁️ View Details
                      </button>
                    </div>
                  </div>
                  <div className="premium-project-content">
                    <div className="premium-project-header">
                      <h3 className="premium-project-title">{project.pname}</h3>
                      <span className="premium-project-type">{project.ptype}</span>
                    </div>
                    <p className="premium-project-description">{project.pdescription}</p>
                    <div className="premium-project-footer">
                      <span className="premium-project-budget">{formatCurrency(project.pbudget)}</span>
                      <span className="premium-project-location">
                        📍 {project.plocation}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredProjects.length === 0 && !loading && (
            <div className="premium-no-results">
              <div className="premium-no-results-icon">🔍</div>
              <p>No projects found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>

      {/* Premium About Section */}
      <section className="premium-about" id="about">
        <div className="premium-container">
          <div className="premium-about-grid">
            <div className="premium-about-content">
              <h2 className="premium-about-title">Building Excellence for the Future</h2>
              <p className="premium-about-text">
                At Workflows Engineering, we've been transforming visions into reality since 2025. 
                Our commitment to quality, innovation, and customer satisfaction has made us a 
                trusted partner for construction projects of all scales.
              </p>
              <div className="premium-stats-grid">
                <div className="premium-stat">
                  <div className="premium-stat-number">500+</div>
                  <div className="premium-stat-label">Projects Completed</div>
                </div>
                <div className="premium-stat">
                  <div className="premium-stat-number">25+</div>
                  <div className="premium-stat-label">Active Clients</div>
                </div>
                <div className="premium-stat">
                  <div className="premium-stat-number">98%</div>
                  <div className="premium-stat-label">Client Satisfaction</div>
                </div>
              </div>
              <button className="premium-btn premium-btn-primary">Learn More About Us</button>
            </div>
            <div className="premium-about-image">
              <img src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Construction Team" />
              <div className="premium-about-badge">
                <div className="premium-badge-title">Excellence</div>
                <div className="premium-badge-subtitle">In Every Detail</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Contact Section */}
      <section className="premium-contact" id="contact">
        <div className="premium-container">
          <div className="premium-section-header">
            <h2 className="premium-section-title">Start Your Project Today</h2>
            <p className="premium-section-subtitle">Ready to build something amazing? Let's discuss your construction needs.</p>
          </div>
          <div className="premium-contact-form">
            <form className="premium-form">
              <div className="premium-form-row">
                <input type="text" placeholder="Your Name" className="premium-form-input" />
                <input type="email" placeholder="Email Address" className="premium-form-input" />
              </div>
              <input type="text" placeholder="Project Type" className="premium-form-input" />
              <textarea placeholder="Tell us about your project..." rows="4" className="premium-form-textarea"></textarea>
              <button type="submit" className="premium-btn premium-btn-primary premium-btn-full">
                Get Free Consultation
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="premium-footer">
        <div className="premium-container">
          <div className="premium-footer-grid">
            <div className="premium-footer-brand">
              <div className="premium-footer-logo">
                <span className="premium-footer-icon">🏗️</span>
                <h3 className="premium-footer-title">Workflows Engineering</h3>
              </div>
              <p className="premium-footer-description">
                Building Your dreams into reality with precision, quality, and excellence.
              </p>
            </div>
            <div className="premium-footer-section">
              <h4 className="premium-footer-heading">Services</h4>
              <ul className="premium-footer-links">
                <li>Residential Construction</li>
                <li>Commercial Projects</li>
                <li>Infrastructure Development</li>
                <li>Renovation & Remodeling</li>
              </ul>
            </div>
            <div className="premium-footer-section">
              <h4 className="premium-footer-heading">Quick Links</h4>
              <ul className="premium-footer-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#projects">Projects</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>
            <div className="premium-footer-section">
              <h4 className="premium-footer-heading">Contact Info</h4>
              <div className="premium-footer-contact">
                <div>📧 info@workflowsengineering.com</div>
                <div>📞 (+94) 71-452-9412</div>
                <div>📍 123 Construction Ave, Kottawa </div>
              </div>
            </div>
          </div>
          <div className="premium-footer-bottom">
            <p>&copy; 2025 Workflows Engineering. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Premium Project Detail Modal */}
      {showModal && selectedProject && (
        <div className="premium-modal-overlay" onClick={closeModal}>
          <div className="premium-modal" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="premium-modal-header">
              {selectedProject.pimg && selectedProject.pimg.length > 0 ? (
                <div className="premium-modal-image-container">
                  <img
                    src={selectedProject.pimg[currentImageIndex]}
                    alt={selectedProject.pname}
                    className="premium-modal-image"
                  />
                  {selectedProject.pimg.length > 1 && (
                    <>
                      <button onClick={prevImage} className="premium-modal-nav premium-modal-prev">‹</button>
                      <button onClick={nextImage} className="premium-modal-nav premium-modal-next">›</button>
                      <div className="premium-modal-indicators">
                        {selectedProject.pimg.map((_, index) => (
                          <div
                            key={index}
                            className={`premium-modal-indicator ${index === currentImageIndex ? 'active' : ''}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="premium-modal-placeholder">
                  <span className="premium-placeholder-icon">🏢</span>
                </div>
              )}
              <button onClick={closeModal} className="premium-modal-close">✕</button>
            </div>

            {/* Modal Content */}
            <div className="premium-modal-content">
              {/* Project Header */}
              <div className="premium-modal-project-header">
                <div className="premium-modal-project-info">
                  <h2 className="premium-modal-title">{selectedProject.pname}</h2>
                  <div className="premium-modal-meta">
                    <span className="premium-modal-location">📍 {selectedProject.plocation}</span>
                    <span className="premium-modal-type">🏗️ {selectedProject.ptype}</span>
                  </div>
                </div>
                <div className="premium-modal-project-status">
                  <div className="premium-modal-budget">{formatCurrency(selectedProject.pbudget)}</div>
                  <span className={`premium-modal-status ${getStatusColor(selectedProject.pstatus)}`}>
                    {selectedProject.pstatus}
                  </span>
                </div>
              </div>

              {/* Project Details Grid */}
              <div className="premium-modal-details-grid">
                <div className="premium-modal-details-left">
                  <div className="premium-modal-info-card">
                    <h3 className="premium-modal-card-title">📋 Project Information</h3>
                    <div className="premium-modal-info-list">
                      <div className="premium-modal-info-item">
                        <span>Project Code:</span>
                        <span>{selectedProject.pcode}</span>
                      </div>
                      <div className="premium-modal-info-item">
                        <span>Owner:</span>
                        <span>{selectedProject.pownername}</span>
                      </div>
                      <div className="premium-modal-info-item">
                        <span>Priority:</span>
                        <span className={`premium-priority-badge ${getPriorityColor(selectedProject.ppriority)}`}>
                          {selectedProject.ppriority}
                        </span>
                      </div>
                      <div className="premium-modal-info-item">
                        <span>Start Date:</span>
                        <span>{new Date(selectedProject.pcreatedat).toLocaleDateString()}</span>
                      </div>
                      <div className="premium-modal-info-item">
                        <span>End Date:</span>
                        <span>{new Date(selectedProject.penddate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {selectedProject.pissues && selectedProject.pissues.length > 0 && (
                    <div className="premium-modal-issues-card">
                      <h3 className="premium-modal-card-title">⚠️ Active Issues ({selectedProject.pissues.length})</h3>
                      <div className="premium-modal-issues-list">
                        {selectedProject.pissues.slice(0, 3).map((issue, index) => (
                          <div key={index} className="premium-modal-issue-item">
                            • {typeof issue === 'string' ? issue : issue.description || 'Issue details not available'}
                          </div>
                        ))}
                        {selectedProject.pissues.length > 3 && (
                          <div className="premium-modal-more-issues">
                            +{selectedProject.pissues.length - 3} more issues
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="premium-modal-details-right">
                  <div className="premium-modal-description-card">
                    <h3 className="premium-modal-card-title">📝 Description</h3>
                    <p className="premium-modal-description">
                      {selectedProject.pdescription || 'No description available for this project.'}
                    </p>
                  </div>

                  {selectedProject.pobservations && (
                    <div className="premium-modal-observations-card">
                      <h3 className="premium-modal-card-title">👁️ Observations</h3>
                      <p className="premium-modal-observations">
                        {selectedProject.pobservations}
                      </p>
                    </div>
                  )}

                  <div className="premium-modal-stats-card">
                    <h3 className="premium-modal-card-title">📊 Project Stats</h3>
                    <div className="premium-modal-stats-grid">
                      <div className="premium-modal-stat">
                        <div className="premium-modal-stat-number">
                          {Math.floor((new Date() - new Date(selectedProject.pcreatedat)) / (1000 * 60 * 60 * 24))}
                        </div>
                        <div className="premium-modal-stat-label">Days Running</div>
                      </div>
                      <div className="premium-modal-stat">
                        <div className="premium-modal-stat-number">
                          {selectedProject.pstatus === 'Completed' ? '100' : 
                           selectedProject.pstatus === 'In Progress' ? '65' : 
                           selectedProject.pstatus === 'Planning' ? '15' : '0'}%
                        </div>
                        <div className="premium-modal-stat-label">Progress</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="premium-modal-actions">
                {/*<button className="premium-btn premium-btn-primary">📥 Export Details</button>
                <button className="premium-btn premium-btn-secondary">📤 Share Project</button>*/}
                <button onClick={closeModal} className="premium-btn premium-btn-outline">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProjects;
