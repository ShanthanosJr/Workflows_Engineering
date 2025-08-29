import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Nav from "../Nav/Nav";

export default function FinancialDashboardView() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Ensure FontAwesome is loaded with multiple fallback strategies
  useEffect(() => {
    // Strategy 1: Check if FontAwesome is already loaded
    const existingLink = document.querySelector('link[href*="font-awesome"]');
    
    if (!existingLink) {
      // Strategy 2: Add FontAwesome CSS link
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
      
      // Strategy 3: Verify loading and add fallback
      link.onload = () => {
        console.log('✅ FontAwesome loaded successfully');
      };
      
      link.onerror = () => {
        console.warn('⚠️ FontAwesome failed to load, using emoji fallbacks');
        // Force fallback by adding a class to body
        document.body.classList.add('fontawesome-fallback');
      };
    }
    
    // Strategy 4: Test FontAwesome loading after a delay
    setTimeout(() => {
      const testElement = document.createElement('i');
      testElement.className = 'fas fa-heart';
      testElement.style.position = 'absolute';
      testElement.style.left = '-9999px';
      document.body.appendChild(testElement);
      
      const computedStyle = window.getComputedStyle(testElement);
      const fontFamily = computedStyle.fontFamily;
      
      if (!fontFamily.includes('Font Awesome')) {
        console.warn('⚠️ FontAwesome not detected, activating fallbacks');
        document.body.classList.add('fontawesome-fallback');
      } else {
        console.log('✅ FontAwesome verified and working');
      }
      
      document.body.removeChild(testElement);
    }, 1000);
  }, []);
  
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchDashboardDetails = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching dashboard details for ID:', id);
      
      const response = await axios.get(`http://localhost:5050/financial-dashboard/${id}`);
      setDashboard(response.data.data);
      
      console.log('✅ Dashboard details loaded');
    } catch (error) {
      console.error('❌ Error fetching dashboard details:', error);
      alert('Error loading dashboard details. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDashboardDetails();
  }, [id, fetchDashboardDetails]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Removed unused getProgressBarColor function

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
                  <h4 className="text-muted">Loading Dashboard Details...</h4>
                  <p className="text-secondary">Please wait while we fetch the financial analysis.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!dashboard) {
    return (
      <>
        <Nav />
        <div className="container mt-5">
          <div className="row justify-content-center">
            <div className="col-md-6 text-center">
              <div className="card shadow-lg border-0">
                <div className="card-body p-5">
                  <h4 className="text-danger">Dashboard Not Found</h4>
                  <p className="text-secondary">The requested financial dashboard could not be found.</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/financial-dashboard')}
                  >
                    Back to Dashboard List
                  </button>
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
      
      {/* Header Section */}
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
                <span className="me-3">📊</span>
                {dashboard.dashboardName}
              </h1>
              <p className="lead mb-0 opacity-90">
                Dashboard ID: {dashboard.dashboardId} | Created: {formatDate(dashboard.createdAt)}
              </p>
            </div>
            <div className="col-lg-4 text-end">
              <button 
                className="btn btn-light btn-lg shadow-sm me-2"
                onClick={() => navigate('/financial-dashboard')}
                style={{borderRadius: '50px', padding: '12px 30px'}}
              >
                <span className="me-2">⬅️</span> Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Summary Cards */}
        <div className="row g-4 mb-5">
          <div className="col-lg-3 col-md-6">
            <div className="card border-0 shadow-sm h-100" style={{
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(40,167,69,0.1) 0%, rgba(40,167,69,0.05) 100%)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 15px 35px rgba(40,167,69,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
            }}>
              <div className="card-body text-center p-4">
                <div className="position-relative mb-3">
                  <div 
                    className="rounded-circle mx-auto d-flex align-items-center justify-content-center position-relative"
                    style={{
                      width: '80px', 
                      height: '80px',
                      background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                      boxShadow: '0 8px 25px rgba(40,167,69,0.3)'
                    }}
                  >
                    <i className="fas fa-dollar-sign text-white" style={{fontSize: '1.8rem', fontFamily: 'FontAwesome'}}></i>
                    {/* Fallback if FontAwesome doesn't load */}
                    <span style={{fontSize: '1.8rem', display: 'none'}} className="fallback-icon">💰</span>
                  </div>
                  <div 
                    className="position-absolute rounded-circle"
                    style={{
                      top: '-5px',
                      right: '-5px',
                      width: '30px',
                      height: '30px',
                      background: 'linear-gradient(45deg, #ffc107, #e0a800)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 15px rgba(255,193,7,0.3)'
                    }}
                  >
                    <i className="fas fa-crown text-white" style={{fontSize: '0.8rem'}}></i>
                  </div>
                </div>
                <h3 className="fw-bold text-success mb-1" style={{fontSize: '1.5rem'}}>{formatCurrency(dashboard.financialSummary?.grandTotal)}</h3>
                <p className="text-muted mb-0 fw-semibold">Grand Total</p>
                <div className="progress mt-2" style={{height: '4px'}}>
                  <div className="progress-bar bg-success" style={{width: '100%'}}></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-lg-3 col-md-6">
            <div className="card border-0 shadow-sm h-100" style={{
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(0,123,255,0.1) 0%, rgba(0,123,255,0.05) 100%)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,123,255,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
            }}>
              <div className="card-body text-center p-4">
                <div className="position-relative mb-3">
                  <div 
                    className="rounded-circle mx-auto d-flex align-items-center justify-content-center position-relative"
                    style={{
                      width: '80px', 
                      height: '80px',
                      background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                      boxShadow: '0 8px 25px rgba(0,123,255,0.3)'
                    }}
                  >
                    <i className="fas fa-users text-white" style={{fontSize: '1.8rem', fontFamily: 'FontAwesome'}}></i>
                    {/* Fallback if FontAwesome doesn't load */}
                    <span style={{fontSize: '1.8rem', display: 'none'}} className="fallback-icon">👥</span>
                  </div>
                  <div 
                    className="position-absolute rounded-circle"
                    style={{
                      top: '-5px',
                      right: '-5px',
                      width: '30px',
                      height: '30px',
                      background: 'linear-gradient(45deg, #28a745, #20c997)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 15px rgba(40,167,69,0.3)'
                    }}
                  >
                    <i className="fas fa-briefcase text-white" style={{fontSize: '0.8rem'}}></i>
                  </div>
                </div>
                <h3 className="fw-bold text-primary mb-1" style={{fontSize: '1.5rem'}}>{formatCurrency(dashboard.totalLaborCost)}</h3>
                <p className="text-muted mb-0 fw-semibold">Labor Costs</p>
                <div className="progress mt-2" style={{height: '4px'}}>
                  <div className="progress-bar bg-primary" style={{width: '85%'}}></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-lg-3 col-md-6">
            <div className="card border-0 shadow-sm h-100" style={{
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(255,193,7,0.1) 0%, rgba(255,193,7,0.05) 100%)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 15px 35px rgba(255,193,7,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
            }}>
              <div className="card-body text-center p-4">
                <div className="position-relative mb-3">
                  <div 
                    className="rounded-circle mx-auto d-flex align-items-center justify-content-center position-relative"
                    style={{
                      width: '80px', 
                      height: '80px',
                      background: 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)',
                      boxShadow: '0 8px 25px rgba(255,193,7,0.3)'
                    }}
                  >
                    <i className="fas fa-boxes text-white" style={{fontSize: '1.8rem', fontFamily: 'FontAwesome'}}></i>
                    {/* Fallback if FontAwesome doesn't load */}
                    <span style={{fontSize: '1.8rem', display: 'none'}} className="fallback-icon">📦</span>
                  </div>
                  <div 
                    className="position-absolute rounded-circle"
                    style={{
                      top: '-5px',
                      right: '-5px',
                      width: '30px',
                      height: '30px',
                      background: 'linear-gradient(45deg, #17a2b8, #138496)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 15px rgba(23,162,184,0.3)'
                    }}
                  >
                    <i className="fas fa-cube text-white" style={{fontSize: '0.8rem'}}></i>
                  </div>
                </div>
                <h3 className="fw-bold text-warning mb-1" style={{fontSize: '1.5rem'}}>{formatCurrency(dashboard.totalMaterialCost)}</h3>
                <p className="text-muted mb-0 fw-semibold">Material Costs</p>
                <div className="progress mt-2" style={{height: '4px'}}>
                  <div className="progress-bar bg-warning" style={{width: '70%'}}></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-lg-3 col-md-6">
            <div className="card border-0 shadow-sm h-100" style={{
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(23,162,184,0.1) 0%, rgba(23,162,184,0.05) 100%)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 15px 35px rgba(23,162,184,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
            }}>
              <div className="card-body text-center p-4">
                <div className="position-relative mb-3">
                  <div 
                    className="rounded-circle mx-auto d-flex align-items-center justify-content-center position-relative"
                    style={{
                      width: '80px', 
                      height: '80px',
                      background: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)',
                      boxShadow: '0 8px 25px rgba(23,162,184,0.3)'
                    }}
                  >
                    <i className="fas fa-tools text-white" style={{fontSize: '1.8rem', fontFamily: 'FontAwesome'}}></i>
                    {/* Fallback if FontAwesome doesn't load */}
                    <span style={{fontSize: '1.8rem', display: 'none'}} className="fallback-icon">🔧</span>
                  </div>
                  <div 
                    className="position-absolute rounded-circle"
                    style={{
                      top: '-5px',
                      right: '-5px',
                      width: '30px',
                      height: '30px',
                      background: 'linear-gradient(45deg, #6f42c1, #5a32a3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 15px rgba(111,66,193,0.3)'
                    }}
                  >
                    <i className="fas fa-cog text-white" style={{fontSize: '0.8rem'}}></i>
                  </div>
                </div>
                <h3 className="fw-bold text-info mb-1" style={{fontSize: '1.5rem'}}>{formatCurrency(dashboard.totalToolCost)}</h3>
                <p className="text-muted mb-0 fw-semibold">Tool Costs</p>
                <div className="progress mt-2" style={{height: '4px'}}>
                  <div className="progress-bar bg-info" style={{width: '60%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="card shadow-lg border-0 mb-4" style={{borderRadius: '20px'}}>
          <div className="card-header border-0 bg-light" style={{borderRadius: '20px 20px 0 0', padding: '1rem 2rem'}}>
            <ul className="nav nav-pills nav-fill">
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                  style={{borderRadius: '25px', margin: '0 5px'}}
                >
                  <i className="fas fa-chart-pie me-2"></i>Overview
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'projects' ? 'active' : ''}`}
                  onClick={() => setActiveTab('projects')}
                  style={{borderRadius: '25px', margin: '0 5px'}}
                >
                  <i className="fas fa-building me-2"></i>Projects
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'labor' ? 'active' : ''}`}
                  onClick={() => setActiveTab('labor')}
                  style={{borderRadius: '25px', margin: '0 5px'}}
                >
                  <i className="fas fa-users me-2"></i>Labor Analytics
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'resources' ? 'active' : ''}`}
                  onClick={() => setActiveTab('resources')}
                  style={{borderRadius: '25px', margin: '0 5px'}}
                >
                  <i className="fas fa-boxes me-2"></i>Resources
                </button>
              </li>
            </ul>
          </div>
          
          <div className="card-body p-4">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                <h4 className="mb-4">📊 Financial Overview</h4>
                
                <div className="row g-4">
                  <div className="col-lg-6">
                    <div className="card border-0 bg-light h-100">
                      <div className="card-body">
                        <h6 className="fw-bold mb-3">Cost Breakdown</h6>
                        <div className="mb-3">
                          <div className="d-flex justify-content-between mb-1">
                            <span>Labor Costs</span>
                            <span>{formatCurrency(dashboard.totalLaborCost)}</span>
                          </div>
                          <div className="progress mb-2" style={{height: '8px'}}>
                            <div 
                              className="progress-bar bg-primary" 
                              style={{width: `${(dashboard.totalLaborCost / dashboard.financialSummary?.grandTotal) * 100}%`}}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <div className="d-flex justify-content-between mb-1">
                            <span>Material Costs</span>
                            <span>{formatCurrency(dashboard.totalMaterialCost)}</span>
                          </div>
                          <div className="progress mb-2" style={{height: '8px'}}>
                            <div 
                              className="progress-bar bg-warning" 
                              style={{width: `${(dashboard.totalMaterialCost / dashboard.financialSummary?.grandTotal) * 100}%`}}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <div className="d-flex justify-content-between mb-1">
                            <span>Tool Costs</span>
                            <span>{formatCurrency(dashboard.totalToolCost)}</span>
                          </div>
                          <div className="progress mb-2" style={{height: '8px'}}>
                            <div 
                              className="progress-bar bg-info" 
                              style={{width: `${(dashboard.totalToolCost / dashboard.financialSummary?.grandTotal) * 100}%`}}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <div className="d-flex justify-content-between mb-1">
                            <span>Other Expenses</span>
                            <span>{formatCurrency(dashboard.totalExpenses)}</span>
                          </div>
                          <div className="progress mb-2" style={{height: '8px'}}>
                            <div 
                              className="progress-bar bg-danger" 
                              style={{width: `${(dashboard.totalExpenses / dashboard.financialSummary?.grandTotal) * 100}%`}}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-lg-6">
                    <div className="card border-0 bg-light h-100">
                      <div className="card-body">
                        <h6 className="fw-bold mb-3">Project Statistics</h6>
                        <div className="row g-3">
                          <div className="col-6">
                            <div className="text-center">
                              <div className="h3 text-primary mb-1">{dashboard.financialSummary?.projectCount || 0}</div>
                              <small className="text-muted">Total Projects</small>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="text-center">
                              <div className="h3 text-info mb-1">{dashboard.financialSummary?.timelineEntries || 0}</div>
                              <small className="text-muted">Timeline Entries</small>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="text-center">
                              <div className="h3 text-success mb-1">{formatCurrency(dashboard.financialSummary?.averageProjectCost)}</div>
                              <small className="text-muted">Avg Project Cost</small>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="text-center">
                              <div className="h3 text-warning mb-1">{(dashboard.financialSummary?.roi || 0).toFixed(1)}%</div>
                              <small className="text-muted">ROI</small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Projects Tab */}
            {activeTab === 'projects' && (
              <div>
                <h4 className="mb-4">🏢 Project Breakdown</h4>
                
                {dashboard.projectBreakdown?.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Project</th>
                          <th>Type</th>
                          <th>Priority</th>
                          <th>Total Cost</th>
                          <th>Labor</th>
                          <th>Materials</th>
                          <th>Tools</th>
                          <th>Resources</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboard.projectBreakdown.map((project, index) => (
                          <tr key={index}>
                            <td>
                              <div>
                                <strong>{project.projectCode}</strong><br />
                                <small className="text-muted">{project.projectName}</small>
                              </div>
                            </td>
                            <td>
                              <span className="badge bg-secondary">{project.projectType}</span>
                            </td>
                            <td>
                              <span className={`badge ${
                                project.projectPriority === 'Critical' ? 'bg-danger' :
                                project.projectPriority === 'High' ? 'bg-warning text-dark' :
                                project.projectPriority === 'Medium' ? 'bg-info' : 'bg-success'
                              }`}>
                                {project.projectPriority}
                              </span>
                            </td>
                            <td className="fw-bold text-success">{formatCurrency(project.totalCost)}</td>
                            <td>{formatCurrency(project.laborCost)}</td>
                            <td>{formatCurrency(project.materialCost)}</td>
                            <td>{formatCurrency(project.toolCost)}</td>
                            <td>
                              <small>
                                {project.workerCount}W / {project.engineerCount}E / {project.architectCount}A / {project.pmCount}PM
                              </small>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <i className="fas fa-building text-muted" style={{fontSize: '3rem'}}></i>
                    <p className="text-muted mt-3">No project breakdown data available</p>
                  </div>
                )}
              </div>
            )}

            {/* Labor Analytics Tab */}
            {activeTab === 'labor' && (
              <div>
                <h4 className="mb-4">👥 Labor Analytics</h4>
                
                <div className="row g-4 mb-4">
                  <div className="col-lg-3 col-md-6">
                    <div className="card border-0 bg-primary bg-opacity-10">
                      <div className="card-body text-center">
                        <h3 className="text-primary">{dashboard.laborAnalytics?.totalWorkers || 0}</h3>
                        <p className="mb-0 text-muted">Total Workers</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6">
                    <div className="card border-0 bg-success bg-opacity-10">
                      <div className="card-body text-center">
                        <h3 className="text-success">{dashboard.laborAnalytics?.totalEngineers || 0}</h3>
                        <p className="mb-0 text-muted">Total Engineers</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6">
                    <div className="card border-0 bg-info bg-opacity-10">
                      <div className="card-body text-center">
                        <h3 className="text-info">{dashboard.laborAnalytics?.totalArchitects || 0}</h3>
                        <p className="mb-0 text-muted">Total Architects</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6">
                    <div className="card border-0 bg-warning bg-opacity-10">
                      <div className="card-body text-center">
                        <h3 className="text-warning">{dashboard.laborAnalytics?.totalProjectManagers || 0}</h3>
                        <p className="mb-0 text-muted">Project Managers</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="row g-4">
                  <div className="col-lg-6">
                    <div className="card border-0 bg-light">
                      <div className="card-body">
                        <h6 className="fw-bold mb-3">Labor Summary</h6>
                        <div className="mb-2">
                          <strong>Total Labor Hours:</strong> {(dashboard.laborAnalytics?.totalLaborHours || 0).toLocaleString()}
                        </div>
                        <div className="mb-2">
                          <strong>Average Hourly Rate:</strong> {formatCurrency(dashboard.laborAnalytics?.averageHourlyRate)}
                        </div>
                        <div className="mb-2">
                          <strong>Total Labor Cost:</strong> {formatCurrency(dashboard.totalLaborCost)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="card border-0 bg-light">
                      <div className="card-body">
                        <h6 className="fw-bold mb-3">Cost Distribution</h6>
                        <canvas id="laborChart" style={{maxHeight: '200px'}}></canvas>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Resources Tab */}
            {activeTab === 'resources' && (
              <div>
                <h4 className="mb-4">📦 Resource Analytics</h4>
                
                <div className="row g-4">
                  <div className="col-lg-6">
                    <div className="card border-0 shadow-sm">
                      <div className="card-header bg-warning bg-opacity-10">
                        <h6 className="mb-0 fw-bold">📦 Materials Summary</h6>
                      </div>
                      <div className="card-body">
                        <div className="mb-3">
                          <strong>Total Materials:</strong> {dashboard.materialAnalytics?.totalMaterials || 0}
                        </div>
                        <div className="mb-3">
                          <strong>Total Material Cost:</strong> {formatCurrency(dashboard.totalMaterialCost)}
                        </div>
                        {dashboard.materialAnalytics?.materialsByType?.length > 0 && (
                          <div>
                            <h6 className="fw-bold mb-2">Top Materials:</h6>
                            {dashboard.materialAnalytics.materialsByType.slice(0, 5).map((material, index) => (
                              <div key={index} className="d-flex justify-content-between border-bottom py-1">
                                <span>{material.name}</span>
                                <span>{formatCurrency(material.totalCost)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-lg-6">
                    <div className="card border-0 shadow-sm">
                      <div className="card-header bg-info bg-opacity-10">
                        <h6 className="mb-0 fw-bold">🔧 Tools Summary</h6>
                      </div>
                      <div className="card-body">
                        <div className="mb-3">
                          <strong>Total Tools:</strong> {dashboard.toolAnalytics?.totalTools || 0}
                        </div>
                        <div className="mb-3">
                          <strong>Total Tool Cost:</strong> {formatCurrency(dashboard.totalToolCost)}
                        </div>
                        {dashboard.toolAnalytics?.toolsByType?.length > 0 && (
                          <div>
                            <h6 className="fw-bold mb-2">Top Tools:</h6>
                            {dashboard.toolAnalytics.toolsByType.slice(0, 5).map((tool, index) => (
                              <div key={index} className="d-flex justify-content-between border-bottom py-1">
                                <span>{tool.name}</span>
                                <span>{formatCurrency(tool.totalCost)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* FontAwesome Fallback CSS */}
      <style>{`
        /* Ensure FontAwesome icons have proper font family and fallback */
        .fas {
          font-family: "Font Awesome 5 Free", "FontAwesome", sans-serif !important;
          font-weight: 900 !important;
        }
        
        /* Specific icon mappings with fallbacks */
        .fas.fa-dollar-sign:before { content: "\f155"; }
        .fas.fa-users:before { content: "\f0c0"; }
        .fas.fa-boxes:before { content: "\f468"; }
        .fas.fa-tools:before { content: "\f7d9"; }
        .fas.fa-crown:before { content: "\f521"; }
        .fas.fa-briefcase:before { content: "\f0b1"; }
        .fas.fa-cube:before { content: "\f1b2"; }
        .fas.fa-cog:before { content: "\f013"; }
        .fas.fa-chart-pie:before { content: "\f200"; }
        .fas.fa-building:before { content: "\f1ad"; }
        
        /* Emoji fallbacks when FontAwesome fails */
        body.fontawesome-fallback .fas.fa-dollar-sign:before,
        .fas.fa-dollar-sign:empty:after { content: "💰"; font-family: sans-serif !important; }
        
        body.fontawesome-fallback .fas.fa-users:before,
        .fas.fa-users:empty:after { content: "👥"; font-family: sans-serif !important; }
        
        body.fontawesome-fallback .fas.fa-boxes:before,
        .fas.fa-boxes:empty:after { content: "📦"; font-family: sans-serif !important; }
        
        body.fontawesome-fallback .fas.fa-tools:before,
        .fas.fa-tools:empty:after { content: "🔧"; font-family: sans-serif !important; }
        
        body.fontawesome-fallback .fas.fa-crown:before,
        .fas.fa-crown:empty:after { content: "👑"; font-family: sans-serif !important; }
        
        body.fontawesome-fallback .fas.fa-briefcase:before,
        .fas.fa-briefcase:empty:after { content: "💼"; font-family: sans-serif !important; }
        
        body.fontawesome-fallback .fas.fa-cube:before,
        .fas.fa-cube:empty:after { content: "🟩"; font-family: sans-serif !important; }
        
        body.fontawesome-fallback .fas.fa-cog:before,
        .fas.fa-cog:empty:after { content: "⚙️"; font-family: sans-serif !important; }
        
        body.fontawesome-fallback .fas.fa-chart-pie:before,
        .fas.fa-chart-pie:empty:after { content: "📊"; font-family: sans-serif !important; }
        
        body.fontawesome-fallback .fas.fa-building:before,
        .fas.fa-building:empty:after { content: "🏢"; font-family: sans-serif !important; }
        
        /* Force emoji display when FontAwesome fails */
        body.fontawesome-fallback .fas:before {
          font-family: sans-serif !important;
        }
        
        .fas:empty:after {
          display: inline-block;
          font-size: inherit;
        }
      `}</style>
    </>
  );
}