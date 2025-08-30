import React, { useState, useEffect, useCallback } from "react";
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
  const [dateRangePreset, setDateRangePreset] = useState("last30days");
  const [autoDateRange, setAutoDateRange] = useState(true);

  // Statistics
  const [statistics, setStatistics] = useState({
    totalDashboards: 0,
    totalValue: 0,
    avgProjectCost: 0,
    activeDashboards: 0
  });

  const fetchDashboards = useCallback(async () => {
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
  }, []);

  const fetchAvailableProjects = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5050/financial-dashboard/config/projects');
      setAvailableProjects(response.data.data || []);
    } catch (error) {
      console.error('❌ Error fetching projects:', error);
    }
  }, []);

  useEffect(() => {
    fetchDashboards();
    fetchAvailableProjects();
  }, [fetchDashboards, fetchAvailableProjects]);

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

  // Auto-calculate date ranges based on preset
  const applyDateRangePreset = (preset) => {
    const today = new Date();
    const formatDate = (date) => date.toISOString().split('T')[0];
    
    let fromDate, toDate;
    
    switch (preset) {
      case 'last7days':
        fromDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        toDate = today;
        break;
      case 'last30days':
        fromDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        toDate = today;
        break;
      case 'last3months':
        fromDate = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
        toDate = today;
        break;
      case 'last6months':
        fromDate = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate());
        toDate = today;
        break;
      case 'lastyear':
        fromDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
        toDate = today;
        break;
      case 'thismonth':
        fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
        toDate = today;
        break;
      case 'thisyear':
        fromDate = new Date(today.getFullYear(), 0, 1);
        toDate = today;
        break;
      default:
        fromDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        toDate = today;
    }
    
    setDateFrom(formatDate(fromDate));
    setDateTo(formatDate(toDate));
  };

  // Apply date range when preset changes
  useEffect(() => {
    if (autoDateRange && dateRangePreset) {
      applyDateRangePreset(dateRangePreset);
    }
  }, [dateRangePreset, autoDateRange]); // eslint-disable-line react-hooks/exhaustive-deps

  // Initialize with default date range when modal opens
  useEffect(() => {
    if (showCalculationModal && autoDateRange) {
      applyDateRangePreset(dateRangePreset);
    }
  }, [showCalculationModal]); // eslint-disable-line react-hooks/exhaustive-deps

  const getDateRangeLabel = (preset) => {
    const labels = {
      'last7days': 'Last 7 Days',
      'last30days': 'Last 30 Days',
      'last3months': 'Last 3 Months',
      'last6months': 'Last 6 Months',
      'lastyear': 'Last Year',
      'thismonth': 'This Month',
      'thisyear': 'This Year',
      'custom': 'Custom Range'
    };
    return labels[preset] || 'Last 30 Days';
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

      await axios.post('http://localhost:5050/financial-dashboard/calculate', calculationData);
      
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

      {/* Enhanced Calculate New Dashboard Modal */}
      {showCalculationModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.6)'}}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{borderRadius: '25px', overflow: 'hidden'}}>
              {/* Premium Modal Header */}
              <div className="modal-header border-0 position-relative" style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                padding: '2rem'
              }}>
                {/* Background Pattern */}
                <div className="position-absolute top-0 start-0 w-100 h-100" style={{
                  background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="7" cy="7" r="1"/%3E%3Ccircle cx="7" cy="27" r="1"/%3E%3Ccircle cx="7" cy="47" r="1"/%3E%3Ccircle cx="27" cy="7" r="1"/%3E%3Ccircle cx="27" cy="27" r="1"/%3E%3Ccircle cx="27" cy="47" r="1"/%3E%3Ccircle cx="47" cy="7" r="1"/%3E%3Ccircle cx="47" cy="27" r="1"/%3E%3Ccircle cx="47" cy="47" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                  opacity: 0.3
                }}></div>
                
                {/* Header Content */}
                <div className="d-flex align-items-center w-100 position-relative" style={{zIndex: 1}}>
                  <div className="bg-white bg-opacity-20 rounded-circle p-3 me-3" style={{
                    width: '70px',
                    height: '70px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <span style={{fontSize: '2rem'}}>🔢</span>
                  </div>
                  <div className="flex-grow-1">
                    <h4 className="modal-title text-white fw-bold mb-1" style={{fontSize: '1.5rem'}}>
                      Financial Analysis Calculator
                    </h4>
                    <p className="text-white-50 mb-0">Generate comprehensive financial reports with smart analytics</p>
                  </div>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white position-relative" 
                    onClick={() => {
                      setShowCalculationModal(false);
                      // Reset form
                      setDashboardName('');
                      setSelectedProjects([]);
                      setAutoDateRange(true);
                      setDateRangePreset('last30days');
                    }}
                    style={{
                      fontSize: '1.2rem',
                      opacity: 0.8,
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.opacity = '1'}
                    onMouseLeave={(e) => e.target.style.opacity = '0.8'}
                  ></button>
                </div>
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

                  {/* Date Range Section - Premium */}
                  <div className="mb-4">
                    <label className="form-label fw-bold">
                      <span className="me-2">📅</span>
                      Date Range Analysis
                    </label>
                    
                    {/* Auto Date Range Toggle */}
                    <div className="card border-0 shadow-sm mb-3" style={{borderRadius: '12px', background: 'linear-gradient(135deg, rgba(40,167,69,0.1) 0%, rgba(32,201,151,0.05) 100%)'}}>
                      <div className="card-body p-3">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="autoDateRange"
                            checked={autoDateRange}
                            onChange={(e) => {
                              setAutoDateRange(e.target.checked);
                              if (e.target.checked) {
                                applyDateRangePreset(dateRangePreset);
                              }
                            }}
                            style={{transform: 'scale(1.2)'}}
                          />
                          <label className="form-check-label fw-semibold" htmlFor="autoDateRange">
                            <span className="me-2">🤖</span>
                            Smart Date Range Selection
                          </label>
                        </div>
                        <small className="text-muted">
                          Automatically calculate optimal date ranges for comprehensive analysis
                        </small>
                      </div>
                    </div>

                    {/* Date Range Presets */}
                    {autoDateRange && (
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Quick Date Ranges</label>
                        <div className="d-flex flex-wrap gap-2">
                          {[
                            { value: 'last7days', label: 'Last 7 Days', icon: '📅' },
                            { value: 'last30days', label: 'Last 30 Days', icon: '📊' },
                            { value: 'last3months', label: 'Last 3 Months', icon: '📈' },
                            { value: 'last6months', label: 'Last 6 Months', icon: '📉' },
                            { value: 'thismonth', label: 'This Month', icon: '🗓️' },
                            { value: 'thisyear', label: 'This Year', icon: '📆' }
                          ].map(preset => (
                            <button
                              key={preset.value}
                              type="button"
                              className={`btn btn-sm ${
                                dateRangePreset === preset.value 
                                  ? 'btn-primary' 
                                  : 'btn-outline-primary'
                              }`}
                              onClick={() => {
                                setDateRangePreset(preset.value);
                                applyDateRangePreset(preset.value);
                              }}
                              style={{
                                borderRadius: '25px',
                                padding: '8px 16px',
                                fontSize: '0.85rem',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <span className="me-1">{preset.icon}</span>
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Date Range Display */}
                    <div className="card border-0 shadow-sm" style={{borderRadius: '12px', background: 'linear-gradient(135deg, rgba(0,123,255,0.1) 0%, rgba(0,123,255,0.05) 100%)'}}>
                      <div className="card-body p-3">
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label fw-semibold small">From Date</label>
                            <input
                              type="date"
                              className="form-control border-0 shadow-sm"
                              value={dateFrom}
                              onChange={(e) => {
                                setDateFrom(e.target.value);
                                setAutoDateRange(false);
                                setDateRangePreset('custom');
                              }}
                              style={{borderRadius: '8px', padding: '10px'}}
                              disabled={autoDateRange}
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label fw-semibold small">To Date</label>
                            <input
                              type="date"
                              className="form-control border-0 shadow-sm"
                              value={dateTo}
                              onChange={(e) => {
                                setDateTo(e.target.value);
                                setAutoDateRange(false);
                                setDateRangePreset('custom');
                              }}
                              style={{borderRadius: '8px', padding: '10px'}}
                              disabled={autoDateRange}
                            />
                          </div>
                        </div>
                        
                        {/* Date Range Summary */}
                        {dateFrom && dateTo && (
                          <div className="mt-3 p-2 rounded" style={{backgroundColor: 'rgba(40,167,69,0.1)'}}>
                            <small className="text-success fw-semibold">
                              <span className="me-2">📊</span>
                              Analysis Period: {getDateRangeLabel(dateRangePreset)}
                              <br />
                              <span className="text-muted">
                                From {new Date(dateFrom).toLocaleDateString()} to {new Date(dateTo).toLocaleDateString()}
                                ({Math.ceil((new Date(dateTo) - new Date(dateFrom)) / (1000 * 60 * 60 * 24))} days)
                              </span>
                            </small>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <small className="form-text text-muted mt-2">
                      <span className="me-1">💡</span>
                      Smart date ranges provide optimal analysis periods based on your project data
                    </small>
                  </div>
                </form>
              </div>
              
              
              {/* Enhanced Modal Footer */}
              <div className="modal-footer border-0" style={{
                background: 'linear-gradient(135deg, rgba(248,249,250,0.9) 0%, rgba(255,255,255,0.9) 100%)',
                padding: '2rem'
              }}>
                {/* Validation Summary */}
                <div className="flex-grow-1 me-3">
                  <div className="d-flex align-items-center mb-2">
                    {dashboardName.trim() ? (
                      <span className="badge bg-success me-2">
                        <span className="me-1">✓</span> Dashboard Name
                      </span>
                    ) : (
                      <span className="badge bg-secondary me-2">
                        <span className="me-1">•</span> Dashboard Name Required
                      </span>
                    )}
                    
                    {dateFrom && dateTo ? (
                      <span className="badge bg-success me-2">
                        <span className="me-1">✓</span> Date Range Set
                      </span>
                    ) : (
                      <span className="badge bg-info me-2">
                        <span className="me-1">📅</span> Auto Date Range
                      </span>
                    )}
                    
                    {selectedProjects.length > 0 ? (
                      <span className="badge bg-primary">
                        <span className="me-1">🏢</span> {selectedProjects.length} Project{selectedProjects.length !== 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="badge bg-warning">
                        <span className="me-1">🏢</span> All Projects
                      </span>
                    )}
                  </div>
                  
                  <small className="text-muted">
                    <span className="me-2">💡</span>
                    {autoDateRange 
                      ? `Smart analysis for ${getDateRangeLabel(dateRangePreset).toLowerCase()}`
                      : 'Custom date range analysis'
                    }
                  </small>
                </div>
                
                {/* Action Buttons */}
                <div className="d-flex gap-3">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary btn-lg"
                    onClick={() => {
                      setShowCalculationModal(false);
                      // Reset form
                      setDashboardName('');
                      setSelectedProjects([]);
                      setAutoDateRange(true);
                      setDateRangePreset('last30days');
                    }}
                    style={{
                      borderRadius: '50px', 
                      padding: '12px 25px',
                      transition: 'all 0.3s ease',
                      border: '2px solid #6c757d'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 25px rgba(108,117,125,0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <span className="me-2">✕</span> Cancel
                  </button>
                  
                  <button 
                    type="button" 
                    className="btn btn-lg shadow-lg"
                    onClick={handleCalculateNewDashboard}
                    disabled={calculatingNew || !dashboardName.trim()}
                    style={{
                      borderRadius: '50px', 
                      padding: '12px 30px',
                      background: calculatingNew || !dashboardName.trim() 
                        ? 'linear-gradient(45deg, #6c757d, #5a6268)'
                        : 'linear-gradient(45deg, #28a745, #20c997)',
                      border: 'none',
                      color: 'white',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      if (!calculatingNew && dashboardName.trim()) {
                        e.target.style.transform = 'translateY(-3px)';
                        e.target.style.boxShadow = '0 15px 40px rgba(40,167,69,0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                    }}
                  >
                    {/* Button shimmer effect */}
                    {!calculatingNew && dashboardName.trim() && (
                      <div className="position-absolute top-0 start-0 w-100 h-100" style={{
                        background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
                        animation: 'shimmer 2s infinite',
                        pointerEvents: 'none'
                      }}></div>
                    )}
                    
                    <span className="position-relative">
                      {calculatingNew ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Calculating Analytics...
                        </>
                      ) : (
                        <>
                          <span className="me-2">🔢</span> 
                          Generate Financial Report
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Enhanced FontAwesome Fallback CSS & Premium Animations */}
      <style>{`
        /* Ensure FontAwesome icons have proper font family and fallback */
        .fas {
          font-family: "Font Awesome 5 Free", "FontAwesome", sans-serif !important;
          font-weight: 900 !important;
        }
        
        /* Premium Animations */
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Modal enhancements */
        .modal {
          animation: fadeIn 0.3s ease-out;
        }
        
        .modal-content {
          animation: slideIn 0.4s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        /* Button hover effects */
        .btn:hover {
          transform: translateY(-2px) !important;
        }
        
        /* Card hover animations */
        .card {
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
        }
        
        /* Badge animations */
        .badge {
          animation: slideIn 0.3s ease-out;
          transition: all 0.2s ease;
        }
        
        .badge:hover {
          transform: scale(1.05);
        }
        
        /* Progress bar animations */
        .progress-bar {
          animation: progressFill 1.5s ease-out;
        }
        
        @keyframes progressFill {
          from { width: 0% !important; }
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
        
        /* Premium scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(45deg, #667eea, #764ba2);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(45deg, #764ba2, #667eea);
        }
      `}</style>
    </>
  );
}