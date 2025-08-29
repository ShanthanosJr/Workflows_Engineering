import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Nav from "../Nav/Nav";

export default function FinancialDashboard() {
  const navigate = useNavigate();
  
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
  
  const [dashboards, setDashboards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calculatingNew, setCalculatingNew] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // New calculation form states
  const [showCalculationModal, setShowCalculationModal] = useState(false);
  const [availableProjects, setAvailableProjects] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [dashboardName, setDashboardName] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Statistics
  const [statistics, setStatistics] = useState({
    totalDashboards: 0,
    totalValue: 0,
    avgProjectCost: 0,
    activeDashboards: 0
  });

  useEffect(() => {
    fetchDashboards();
    fetchAvailableProjects();
  }, []);

  const fetchDashboards = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching financial dashboards...');
      
      const response = await axios.get('http://localhost:5050/financial-dashboard');
      const dashboardData = response.data.data || [];
      
      setDashboards(dashboardData);
      calculateStatistics(dashboardData);
      
      console.log(`✅ Loaded ${dashboardData.length} financial dashboards`);
    } catch (error) {
      console.error('❌ Error fetching dashboards:', error);
      alert('Error loading financial dashboards. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableProjects = async () => {
    try {
      const response = await axios.get('http://localhost:5050/financial-dashboard/config/projects');
      setAvailableProjects(response.data.data || []);
    } catch (error) {
      console.error('❌ Error fetching projects:', error);
    }
  };

  const calculateStatistics = (data) => {
    const stats = {
      totalDashboards: data.length,
      totalValue: data.reduce((sum, dashboard) => sum + (dashboard.financialSummary?.grandTotal || 0), 0),
      avgProjectCost: 0,
      activeDashboards: data.filter(d => d.status === 'Active').length
    };
    
    stats.avgProjectCost = stats.totalDashboards > 0 ? stats.totalValue / stats.totalDashboards : 0;
    setStatistics(stats);
  };

  const handleCalculateNewDashboard = async () => {
    if (!dashboardName.trim()) {
      alert('Please enter a dashboard name');
      return;
    }

    try {
      setCalculatingNew(true);
      console.log('🔢 Starting new financial calculation...');

      const calculationData = {
        dashboardName,
        selectedProjects: selectedProjects.length > 0 ? selectedProjects : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined
      };

      const response = await axios.post('http://localhost:5050/financial-dashboard/calculate', calculationData);
      
      console.log('✅ Financial calculation completed');
      alert('✅ Financial dashboard calculated successfully!');
      
      // Reset form and close modal
      setDashboardName('');
      setSelectedProjects([]);
      setDateFrom('');
      setDateTo('');
      setShowCalculationModal(false);
      
      // Refresh dashboards
      fetchDashboards();
      
    } catch (error) {
      console.error('❌ Error calculating dashboard:', error);
      alert(`❌ Error calculating financial dashboard: ${error.response?.data?.message || error.message}`);
    } finally {
      setCalculatingNew(false);
    }
  };

  const handleDeleteDashboard = async (id, dashboardName) => {
    if (window.confirm(`Are you sure you want to delete the dashboard "${dashboardName}"?`)) {
      try {
        await axios.delete(`http://localhost:5050/financial-dashboard/${id}`);
        alert('✅ Financial dashboard deleted successfully!');
        fetchDashboards();
      } catch (error) {
        console.error('❌ Error deleting dashboard:', error);
        alert(`❌ Error deleting dashboard: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  // Filter and sort dashboards
  const filteredDashboards = dashboards
    .filter(dashboard => {
      const matchesSearch = dashboard.dashboardName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dashboard.dashboardId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "All" || dashboard.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'grandTotal') {
        aValue = a.financialSummary?.grandTotal || 0;
        bValue = b.financialSummary?.grandTotal || 0;
      }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredDashboards.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDashboards = filteredDashboards.slice(startIndex, startIndex + itemsPerPage);

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
      month: 'short',
      day: 'numeric'
    });
  };

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
                  <h4 className="text-muted">Loading Financial Dashboard...</h4>
                  <p className="text-secondary">Please wait while we fetch the financial data.</p>
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
      
      {/* Modern Header Section */}
      <div className="bg-gradient financial-dashboard" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '2rem 0',
        marginBottom: '2rem',
        position: 'relative'
      }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <h1 className="display-5 fw-bold mb-2">
                <span className="me-3">💰</span>
                Financial Dashboard
              </h1>
              <p className="lead mb-0 opacity-90">
                Comprehensive financial analysis and cost calculations for all projects and timelines
              </p>
            </div>
            <div className="col-lg-4 text-end">
              <button 
                className="btn btn-light btn-lg shadow-sm"
                onClick={() => setShowCalculationModal(true)}
                style={{borderRadius: '50px', padding: '12px 30px'}}
              >
                <span className="me-2">🔢</span> Calculate New Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="container mb-4">
        <div className="row g-4">
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
                    <i className="fas fa-chart-line text-white" style={{fontSize: '1.8rem', fontFamily: 'FontAwesome'}}></i>
                    {/* Fallback if FontAwesome doesn't load */}
                    <span style={{fontSize: '1.8rem', display: 'none'}} className="fallback-icon">📊</span>
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
                    <i className="fas fa-check text-white" style={{fontSize: '0.8rem'}}></i>
                  </div>
                </div>
                <h3 className="fw-bold text-primary mb-1" style={{fontSize: '1.8rem'}}>{statistics.totalDashboards}</h3>
                <p className="text-muted mb-0 fw-semibold">Total Dashboards</p>
                <div className="progress mt-2" style={{height: '4px'}}>
                  <div className="progress-bar bg-primary" style={{width: '100%'}}></div>
                </div>
              </div>
            </div>
          </div>
          
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
                    <i className="fas fa-arrow-up text-white" style={{fontSize: '0.8rem'}}></i>
                  </div>
                </div>
                <h3 className="fw-bold text-success mb-1" style={{fontSize: '1.5rem'}}>{formatCurrency(statistics.totalValue)}</h3>
                <p className="text-muted mb-0 fw-semibold">Total Value</p>
                <div className="progress mt-2" style={{height: '4px'}}>
                  <div className="progress-bar bg-success" style={{width: '85%'}}></div>
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
                    <i className="fas fa-calculator text-white" style={{fontSize: '1.8rem', fontFamily: 'FontAwesome'}}></i>
                    {/* Fallback if FontAwesome doesn't load */}
                    <span style={{fontSize: '1.8rem', display: 'none'}} className="fallback-icon">🧮</span>
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
                    <i className="fas fa-star text-white" style={{fontSize: '0.8rem'}}></i>
                  </div>
                </div>
                <h3 className="fw-bold text-info mb-1" style={{fontSize: '1.5rem'}}>{formatCurrency(statistics.avgProjectCost)}</h3>
                <p className="text-muted mb-0 fw-semibold">Average Cost</p>
                <div className="progress mt-2" style={{height: '4px'}}>
                  <div className="progress-bar bg-info" style={{width: '70%'}}></div>
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
                    <i className="fas fa-check-circle text-white" style={{fontSize: '1.8rem', fontFamily: 'FontAwesome'}}></i>
                    {/* Fallback if FontAwesome doesn't load */}
                    <span style={{fontSize: '1.8rem', display: 'none'}} className="fallback-icon">✅</span>
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
                    <i className="fas fa-thumbs-up text-white" style={{fontSize: '0.8rem'}}></i>
                  </div>
                </div>
                <h3 className="fw-bold text-warning mb-1" style={{fontSize: '1.8rem'}}>{statistics.activeDashboards}</h3>
                <p className="text-muted mb-0 fw-semibold">Active Dashboards</p>
                <div className="progress mt-2" style={{height: '4px'}}>
                  <div className="progress-bar bg-warning" style={{width: '60%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="container mb-4">
        <div className="card shadow-sm border-0" style={{borderRadius: '16px'}}>
          <div className="card-body p-4">
            <div className="row g-3 align-items-center">
              <div className="col-lg-4">
                <div className="input-group">
                  <span className="input-group-text border-0 bg-light">
                    <i className="fas fa-search text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-0 bg-light"
                    placeholder="Search dashboards..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{borderRadius: '0 12px 12px 0'}}
                  />
                </div>
              </div>
              
              <div className="col-lg-2">
                <select
                  className="form-select border-0 bg-light"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{borderRadius: '12px'}}
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Archived">Archived</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
              
              <div className="col-lg-3">
                <div className="input-group">
                  <select
                    className="form-select border-0 bg-light"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{borderRadius: '12px 0 0 12px'}}
                  >
                    <option value="createdAt">Date Created</option>
                    <option value="dashboardName">Name</option>
                    <option value="grandTotal">Total Value</option>
                    <option value="status">Status</option>
                  </select>
                  <button
                    className="btn btn-outline-secondary border-0 bg-light"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    style={{borderRadius: '0 12px 12px 0'}}
                  >
                    <i className={`fas fa-sort-amount-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>
                  </button>
                </div>
              </div>
              
              <div className="col-lg-3 text-end">
                <span className="text-muted small">
                  Showing {paginatedDashboards.length} of {filteredDashboards.length} dashboards
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Dashboards Table */}
      <div className="container">
        <div className="card shadow-lg border-0" style={{borderRadius: '20px'}}>
          <div className="card-header border-0" style={{
            background: 'linear-gradient(45deg, #28a745, #20c997)',
            borderRadius: '20px 20px 0 0',
            padding: '1.5rem'
          }}>
            <div className="d-flex align-items-center text-white">
              <div className="bg-white bg-opacity-20 rounded-circle p-3 me-3">
                <span style={{fontSize: '1.5rem'}}>📊</span>
              </div>
              <div>
                <h3 className="mb-1 fw-bold">Financial Dashboards</h3>
                <p className="mb-0 opacity-90">Comprehensive financial analysis and calculations</p>
              </div>
            </div>
          </div>
          
          <div className="card-body p-0">
            {filteredDashboards.length === 0 ? (
              <div className="text-center py-5">
                <div className="mb-4">
                  <i className="fas fa-chart-line text-muted" style={{fontSize: '4rem'}}></i>
                </div>
                <h4 className="text-muted mb-3">No Financial Dashboards Found</h4>
                <p className="text-secondary mb-4">Create your first financial dashboard to start tracking project costs and analytics.</p>
                <button 
                  className="btn btn-primary btn-lg shadow-sm"
                  onClick={() => setShowCalculationModal(true)}
                  style={{borderRadius: '50px', padding: '12px 30px'}}
                >
                  <span className="me-2">🔢</span> Calculate New Dashboard
                </button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="border-0 fw-bold text-dark px-4 py-3">Dashboard Info</th>
                      <th className="border-0 fw-bold text-dark px-4 py-3">Financial Summary</th>
                      <th className="border-0 fw-bold text-dark px-4 py-3">Project Details</th>
                      <th className="border-0 fw-bold text-dark px-4 py-3">Status</th>
                      <th className="border-0 fw-bold text-dark px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDashboards.map((dashboard) => (
                      <tr key={dashboard._id} className="border-bottom">
                        <td className="px-4 py-3">
                          <div>
                            <h6 className="mb-1 fw-bold text-dark">{dashboard.dashboardName}</h6>
                            <small className="text-muted">ID: {dashboard.dashboardId}</small><br />
                            <small className="text-muted">Created: {formatDate(dashboard.createdAt)}</small>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="fw-bold text-success fs-5">{formatCurrency(dashboard.financialSummary?.grandTotal)}</div>
                            <small className="text-muted">
                              Labor: {formatCurrency(dashboard.totalLaborCost)}<br />
                              Materials: {formatCurrency(dashboard.totalMaterialCost)}<br />
                              Tools: {formatCurrency(dashboard.totalToolCost)}
                            </small>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <span className="badge bg-primary me-1">{dashboard.financialSummary?.projectCount || 0} Projects</span><br />
                            <span className="badge bg-info me-1">{dashboard.financialSummary?.timelineEntries || 0} Timelines</span><br />
                            <small className="text-muted">Avg: {formatCurrency(dashboard.financialSummary?.averageProjectCost)}</small>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`badge fs-6 ${
                            dashboard.status === 'Active' ? 'bg-success' :
                            dashboard.status === 'Archived' ? 'bg-secondary' : 'bg-warning text-dark'
                          }`}>
                            {dashboard.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="btn-group" role="group">
                            <button
                              className="btn btn-sm"
                              onClick={() => navigate(`/financial-dashboard/view/${dashboard._id}`)}
                              title="View Details"
                              style={{
                                background: 'linear-gradient(45deg, #007bff, #0056b3)',
                                border: 'none',
                                color: 'white',
                                borderRadius: '8px 0 0 8px',
                                padding: '8px 12px',
                                transition: 'all 0.3s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 4px 12px rgba(0,123,255,0.3)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = 'none';
                              }}
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              className="btn btn-sm"
                              onClick={() => navigate(`/financial-dashboard/update/${dashboard._id}`)}
                              title="Edit Dashboard"
                              style={{
                                background: 'linear-gradient(45deg, #28a745, #20c997)',
                                border: 'none',
                                color: 'white',
                                borderRadius: '0',
                                padding: '8px 12px',
                                transition: 'all 0.3s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 4px 12px rgba(40,167,69,0.3)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = 'none';
                              }}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className="btn btn-sm"
                              onClick={() => handleDeleteDashboard(dashboard._id, dashboard.dashboardName)}
                              title="Delete Dashboard"
                              style={{
                                background: 'linear-gradient(45deg, #dc3545, #c82333)',
                                border: 'none',
                                color: 'white',
                                borderRadius: '0 8px 8px 0',
                                padding: '8px 12px',
                                transition: 'all 0.3s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 4px 12px rgba(220,53,69,0.3)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = 'none';
                              }}
                            >
                              <i className="fas fa-trash"></i>
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-center mt-4">
            <nav>
              <ul className="pagination">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                </li>
                
                {[...Array(totalPages)].map((_, index) => (
                  <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(index + 1)}
                    >
                      {index + 1}
                    </button>
                  </li>
                ))}
                
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button 
                    className="page-link"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>

      {/* Calculate New Dashboard Modal */}
      {showCalculationModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{borderRadius: '20px'}}>
              <div className="modal-header border-0" style={{
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                borderRadius: '20px 20px 0 0',
                color: 'white'
              }}>
                <h5 className="modal-title fw-bold">
                  <span className="me-2">🔢</span>
                  Calculate New Financial Dashboard
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowCalculationModal(false)}
                ></button>
              </div>
              
              <div className="modal-body p-4">
                <form onSubmit={(e) => { e.preventDefault(); handleCalculateNewDashboard(); }}>
                  {/* Dashboard Name */}
                  <div className="mb-4">
                    <label className="form-label fw-bold">
                      <span className="me-2">📊</span>
                      Dashboard Name *
                    </label>
                    <input
                      type="text"
                      className="form-control border-0 shadow-sm"
                      placeholder="Enter dashboard name..."
                      value={dashboardName}
                      onChange={(e) => setDashboardName(e.target.value)}
                      style={{borderRadius: '12px', padding: '12px'}}
                      required
                    />
                  </div>

                  {/* Project Selection */}
                  <div className="mb-4">
                    <label className="form-label fw-bold">
                      <span className="me-2">🏢</span>
                      Select Projects (Optional)
                    </label>
                    <div className="card border-0 shadow-sm" style={{borderRadius: '12px', maxHeight: '200px', overflowY: 'auto'}}>
                      <div className="card-body p-3">
                        {availableProjects.map(project => (
                          <div key={project._id} className="form-check mb-2">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id={`project-${project._id}`}
                              value={project.pcode}
                              checked={selectedProjects.includes(project.pcode)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedProjects([...selectedProjects, project.pcode]);
                                } else {
                                  setSelectedProjects(selectedProjects.filter(p => p !== project.pcode));
                                }
                              }}
                            />
                            <label className="form-check-label" htmlFor={`project-${project._id}`}>
                              <strong>{project.pcode}</strong> - {project.pname}
                              <br />
                              <small className="text-muted">{project.ptype} | {project.ppriority}</small>
                            </label>
                          </div>
                        ))}
                        {availableProjects.length === 0 && (
                          <p className="text-muted text-center mb-0">No projects available</p>
                        )}
                      </div>
                    </div>
                    <small className="form-text text-muted">
                      Leave empty to include all projects in calculation
                    </small>
                  </div>

                  {/* Date Range */}
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">
                        <span className="me-2">📅</span>
                        From Date (Optional)
                      </label>
                      <input
                        type="date"
                        className="form-control border-0 shadow-sm"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        style={{borderRadius: '12px', padding: '12px'}}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">
                        <span className="me-2">📅</span>
                        To Date (Optional)
                      </label>
                      <input
                        type="date"
                        className="form-control border-0 shadow-sm"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        style={{borderRadius: '12px', padding: '12px'}}
                      />
                    </div>
                  </div>
                </form>
              </div>
              
              <div className="modal-footer border-0 p-4">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary btn-lg"
                  onClick={() => setShowCalculationModal(false)}
                  style={{borderRadius: '50px', padding: '12px 25px'}}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-lg shadow-sm"
                  onClick={handleCalculateNewDashboard}
                  disabled={calculatingNew}
                  style={{
                    borderRadius: '50px', 
                    padding: '12px 30px',
                    background: 'linear-gradient(45deg, #28a745, #20c997)',
                    border: 'none',
                    color: 'white'
                  }}
                >
                  {calculatingNew ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Calculating...
                    </>
                  ) : (
                    <>
                      <span className="me-2">🔢</span> Calculate Dashboard
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* FontAwesome Fallback CSS */}
      <style>{`
        /* Ensure FontAwesome icons have proper font family and fallback */
        .fas {
          font-family: "Font Awesome 5 Free", "FontAwesome", sans-serif !important;
          font-weight: 900 !important;
        }
        
        /* Specific icon mappings with fallbacks */
        .fas.fa-chart-line:before { content: "\f201"; }
        .fas.fa-dollar-sign:before { content: "\f155"; }
        .fas.fa-calculator:before { content: "\f1ec"; }
        .fas.fa-check-circle:before { content: "\f058"; }
        .fas.fa-check:before { content: "\f00c"; }
        .fas.fa-arrow-up:before { content: "\f062"; }
        .fas.fa-star:before { content: "\f005"; }
        .fas.fa-thumbs-up:before { content: "\f164"; }
        .fas.fa-eye:before { content: "\f06e"; }
        .fas.fa-edit:before { content: "\f044"; }
        .fas.fa-trash:before { content: "\f1f8"; }
        .fas.fa-search:before { content: "\f002"; }
        .fas.fa-sort-amount-up:before { content: "\f160"; }
        .fas.fa-sort-amount-down:before { content: "\f161"; }
        
        /* Emoji fallbacks when FontAwesome fails */
        body.fontawesome-fallback .fas.fa-chart-line:before,
        .fas.fa-chart-line:empty:after { content: "📊"; font-family: sans-serif !important; }
        
        body.fontawesome-fallback .fas.fa-dollar-sign:before,
        .fas.fa-dollar-sign:empty:after { content: "💰"; font-family: sans-serif !important; }
        
        body.fontawesome-fallback .fas.fa-calculator:before,
        .fas.fa-calculator:empty:after { content: "🧮"; font-family: sans-serif !important; }
        
        body.fontawesome-fallback .fas.fa-check-circle:before,
        .fas.fa-check-circle:empty:after { content: "✅"; font-family: sans-serif !important; }
        
        body.fontawesome-fallback .fas.fa-check:before,
        .fas.fa-check:empty:after { content: "✓"; font-family: sans-serif !important; }
        
        body.fontawesome-fallback .fas.fa-arrow-up:before,
        .fas.fa-arrow-up:empty:after { content: "⬆️"; font-family: sans-serif !important; }
        
        body.fontawesome-fallback .fas.fa-star:before,
        .fas.fa-star:empty:after { content: "⭐"; font-family: sans-serif !important; }
        
        body.fontawesome-fallback .fas.fa-thumbs-up:before,
        .fas.fa-thumbs-up:empty:after { content: "👍"; font-family: sans-serif !important; }
        
        body.fontawesome-fallback .fas.fa-eye:before,
        .fas.fa-eye:empty:after { content: "👁️"; font-family: sans-serif !important; }
        
        body.fontawesome-fallback .fas.fa-edit:before,
        .fas.fa-edit:empty:after { content: "✏️"; font-family: sans-serif !important; }
        
        body.fontawesome-fallback .fas.fa-trash:before,
        .fas.fa-trash:empty:after { content: "🗑️"; font-family: sans-serif !important; }
        
        body.fontawesome-fallback .fas.fa-search:before,
        .fas.fa-search:empty:after { content: "🔍"; font-family: sans-serif !important; }
        
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