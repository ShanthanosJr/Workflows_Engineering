import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Nav from "../Nav/Nav";
import {
  BsBuilding,
  BsCurrencyDollar,
  BsGraphUp,
  BsPeople,
  BsFileEarmarkBarGraph,
  BsCalculator,
  BsSearch,
  BsSortAlphaDown,
  BsSortAlphaUp,
  BsChevronLeft,
  BsChevronRight,
  BsDownload,
  BsShare,
  BsPieChart,
  BsBarChart,
  BsCheckCircle,
  BsEye,
  BsTrash
} from "react-icons/bs";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

// Add this import at the top with other imports
import { exportFinancialDashboardToPDF } from '../ExportUtils';

export default function FinancialDashboard() {
  const navigate = useNavigate();
  
  // Debug logging
  useEffect(() => {
    console.log('📍 FinancialDashboard component mounted successfully!');
    console.log('🔍 Current URL:', window.location.href);
  }, []);

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
  const [calculationType, setCalculationType] = useState("standard"); // New: standard, advanced, predictive

  // Statistics
  const [statistics, setStatistics] = useState({
    totalDashboards: 0,
    totalValue: 0,
    avgProjectCost: 0,
    activeDashboards: 0
  });

  // Chart data (mocked for demo, fetch real in production)
  const [chartData, setChartData] = useState({
    pieData: [
      { name: 'Active', value: 65, color: '#10b981' },
      { name: 'Inactive', value: 35, color: '#ef4444' }
    ],
    barData: [
      { month: 'Jan', value: 4000 },
      { month: 'Feb', value: 3000 },
      { month: 'Mar', value: 5000 },
      { month: 'Apr', value: 4500 },
      { month: 'May', value: 6000 },
      { month: 'Jun', value: 5500 }
    ]
  });

  // New: Export and share states
  const [exporting, setExporting] = useState(false);
  const [sharing, setSharing] = useState(false);

  const fetchDashboards = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching financial dashboards...');
      
      const response = await axios.get('http://localhost:5050/financial-dashboard');
      const dashboardData = response.data.data || [];
      
      setDashboards(dashboardData);
      calculateStatistics(dashboardData);
      updateChartData(dashboardData); // New: Update charts
      
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
      console.log('🔄 Fetching available projects...');
      const response = await axios.get('http://localhost:5050/financial-dashboard/config/projects');
      const projects = response.data.data || [];
      // Map the project fields to match what the UI expects
      const mappedProjects = projects.map(project => ({
        id: project.pcode,
        name: project.pname,
        code: project.pcode,
        type: project.ptype,
        priority: project.ppriority,
        status: project.pstatus
      }));
      setAvailableProjects(mappedProjects);
      console.log(`✅ Loaded ${mappedProjects.length} projects`);
    } catch (error) {
      console.error('❌ Error fetching projects:', error);
      alert(`Error loading projects: ${error.response?.data?.message || error.message}. Using empty list.`);
      setAvailableProjects([]); // Fallback to empty
    }
  }, []);

  // New: Update chart data based on dashboards
  const updateChartData = (data) => {
    const activeCount = data.filter(d => d.status === 'Active').length;
    const total = data.length;
    const pieData = [
      { name: 'Active', value: activeCount, color: '#10b981' },
      { name: 'Inactive', value: total - activeCount, color: '#ef4444' }
    ];
    // Mock bar data for revenue - in real, aggregate from data
    setChartData(prev => ({ ...prev, pieData }));
  };

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
  }, [dateRangePreset, autoDateRange]);

  // Initialize with default date range when modal opens
  useEffect(() => {
    if (showCalculationModal && autoDateRange) {
      applyDateRangePreset(dateRangePreset);
    }
  }, [showCalculationModal, dateRangePreset, autoDateRange]);

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
        dateTo: dateTo || undefined,
        calculationType // New: Include type
      };

      const response = await axios.post('http://localhost:5050/financial-dashboard/calculate', calculationData);
      console.log('✅ Response:', response.data);
      
      console.log('✅ Financial calculation completed');
      alert('✅ Financial dashboard calculated successfully!');
      
      // Reset form and close modal
      setDashboardName('');
      setSelectedProjects([]);
      setDateFrom('');
      setDateTo('');
      setCalculationType('standard');
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

  // New: Handle export - fallback to client-side CSV if backend fails
  const handleExport = async (dashboardId, dashboardName) => {
    setExporting(true);
    try {
      console.log('🔄 Exporting dashboard:', dashboardId);
      // First try to get detailed dashboard data for PDF export
      const response = await axios.get(`http://localhost:5050/financial-dashboard/${dashboardId}`);
      const dashboardData = response.data.data;
      
      if (dashboardData) {
        // Use our professional PDF export function
        exportFinancialDashboardToPDF(dashboardData, `${dashboardName}.pdf`);
        console.log('✅ PDF export successful');
      } else {
        // Fallback to backend export if PDF generation fails
        const exportResponse = await axios.get(`http://localhost:5050/financial-dashboard/${dashboardId}/export`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([exportResponse.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `financial-dashboard-${dashboardId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        console.log('✅ Export successful');
      }
    } catch (error) {
      console.error('❌ Export failed:', error);
      // Fallback: Generate simple CSV from current dashboard data (if available)
      const dashboard = dashboards.find(d => d._id === dashboardId);
      if (dashboard) {
        const csvContent = `Dashboard Name,Grand Total,Status,Created At\n${dashboard.dashboardName},${dashboard.financialSummary?.grandTotal || 0},${dashboard.status},${dashboard.createdAt}`;
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${dashboardName}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        alert('✅ CSV export completed (PDF unavailable)');
      } else {
        alert('❌ Export failed: Dashboard not found');
      }
    } finally {
      setExporting(false);
    }
  };

  // New: Handle share - generate share URL
  const handleShare = async (dashboardId) => {
    setSharing(true);
    try {
      console.log('🔄 Sharing dashboard:', dashboardId);
      // Assume backend generates share URL
      const response = await axios.post(`http://localhost:5050/financial-dashboard/${dashboardId}/share`);
      const shareUrl = response.data.shareUrl || `http://localhost:3000/financial-dashboard/${dashboardId}`;
      await navigator.clipboard.writeText(shareUrl);
      alert(`✅ Share URL copied: ${shareUrl}`);
    } catch (error) {
      console.error('❌ Share failed, using direct URL:', error);
      // Fallback: Use direct view URL
      const shareUrl = `http://localhost:3000/financial-dashboard/${dashboardId}`;
      await navigator.clipboard.writeText(shareUrl);
      alert(`✅ Direct URL copied: ${shareUrl} (backend share unavailable)`);
    } finally {
      setSharing(false);
    }
  };

  const handleDeleteDashboard = async (id, dashboardName) => {
    if (window.confirm(`Are you sure you want to delete the dashboard "${dashboardName}"?`)) {
      try {
        console.log('🗑️ Deleting dashboard:', id);
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
              <div className="card shadow-lg border-0" style={{ borderRadius: '24px' }}>
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
    <div style={{ backgroundColor: '#fdfcfb', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <Nav />

      {/* Premium Dashboard-Style Header */}
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
                  <BsFileEarmarkBarGraph className="text-white fs-1" />
                </div>
                <div>
                  <h1 className="display-3 fw-bold mb-1" style={{
                    color: '#1a1a1a',
                    fontWeight: '700',
                    letterSpacing: '-0.02em'
                  }}>Financial Nexus</h1>
                  <p className="h5 text-muted mb-0" style={{ fontWeight: '300' }}>
                    Orchestrate fiscal intelligence with unparalleled acuity
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
                Synthesize comprehensive financial matrices, prognosticate trajectories, and calibrate resource vectors across your enterprise constellation.
              </p>
              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <button onClick={() => navigate("/projects-fd")} className="btn btn-outline-primary btn-lg px-5 py-3 fw-semibold" style={{
                  borderRadius: '50px',
                  border: '2px solid #d4af37',
                  color: '#d4af37',
                  fontWeight: '600',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(212, 175, 55, 0.2)'
                }}>
                  <BsBuilding className="me-2" />View Projects
                </button>
                <button onClick={() => setShowCalculationModal(true)} className="btn btn-primary btn-lg px-5 py-3 fw-semibold" style={{
                  borderRadius: '50px',
                  background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                  border: 'none',
                  color: '#fff',
                  fontWeight: '600',
                  boxShadow: '0 4px 20px rgba(212, 175, 55, 0.4)',
                  transition: 'all 0.3s ease'
                }}>
                  <BsCalculator className="me-2" />Forge Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mb-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            {/* Statistics Cards - Enhanced */}
            <div className="row g-4 mb-5">
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
                        <BsFileEarmarkBarGraph className="text-white" style={{fontSize: '1.8rem'}} />
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
                        <BsCheckCircle className="text-white" style={{fontSize: '0.8rem'}} />
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
                        <BsCurrencyDollar className="text-white" style={{fontSize: '1.8rem'}} />
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
                        <BsGraphUp className="text-white" style={{fontSize: '0.8rem'}} />
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
                        <BsGraphUp className="text-white" style={{fontSize: '1.8rem'}} />
                      </div>
                      <div 
                        className="position-absolute rounded-circle"
                        style={{
                          top: '-5px',
                          right: '-5px',
                          width: '30px',
                          height: '30px',
                          background: 'linear-gradient(45deg, #6f42c1, #5a2d91)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 15px rgba(111,66,193,0.3)'
                        }}
                      >
                        <BsCalculator className="text-white" style={{fontSize: '0.8rem'}} />
                      </div>
                    </div>
                    <h3 className="fw-bold text-info mb-1" style={{fontSize: '1.5rem'}}>{formatCurrency(statistics.avgProjectCost)}</h3>
                    <p className="text-muted mb-0 fw-semibold">Avg Project Cost</p>
                    <div className="progress mt-2" style={{height: '4px'}}>
                      <div className="progress-bar bg-info" style={{width: '70%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-lg-3 col-md-6">
                <div className="card border-0 shadow-sm h-100" style={{
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, rgba(220,53,69,0.1) 0%, rgba(220,53,69,0.05) 100%)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 15px 35px rgba(220,53,69,0.2)';
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
                          background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                          boxShadow: '0 8px 25px rgba(220,53,69,0.3)'
                        }}
                      >
                        <BsPeople className="text-white" style={{fontSize: '1.8rem'}} />
                      </div>
                      <div 
                        className="position-absolute rounded-circle"
                        style={{
                          top: '-5px',
                          right: '-5px',
                          width: '30px',
                          height: '30px',
                          background: 'linear-gradient(45deg, #fd7e14, #e86209)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 15px rgba(253,126,20,0.3)'
                        }}
                      >
                        <BsEye className="text-white" style={{fontSize: '0.8rem'}} />
                      </div>
                    </div>
                    <h3 className="fw-bold text-danger mb-1" style={{fontSize: '1.5rem'}}>{statistics.activeDashboards}</h3>
                    <p className="text-muted mb-0 fw-semibold">Active Dashboards</p>
                    <div className="progress mt-2" style={{height: '4px'}}>
                      <div className="progress-bar bg-danger" style={{width: '60%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section - New */}
            <div className="row g-4 mb-5">
              <div className="col-lg-6">
                <div className="card border-0 shadow-sm" style={{ borderRadius: '20px' }}>
                  <div className="card-header bg-transparent border-0 py-3">
                    <h5 className="mb-0 fw-bold" style={{ color: '#d4af37' }}>
                      <BsPieChart className="me-2" /> Dashboard Distribution
                    </h5>
                  </div>
                  <div className="card-body p-4">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={chartData.pieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {chartData.pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="card border-0 shadow-sm" style={{ borderRadius: '20px' }}>
                  <div className="card-header bg-transparent border-0 py-3">
                    <h5 className="mb-0 fw-bold" style={{ color: '#d4af37' }}>
                      <BsBarChart className="me-2" /> Revenue Trajectory
                    </h5>
                  </div>
                  <div className="card-body p-4">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData.barData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#d4af37" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filters - Enhanced */}
            <div className="card border-0 shadow-sm mb-5" style={{ borderRadius: '20px' }}>
              <div className="card-body p-4">
                <div className="row g-3 align-items-end">
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Search Dashboards</label>
                    <div className="input-group">
                      <span className="input-group-text" style={{ backgroundColor: '#fdfcfb', borderColor: '#e5e7eb' }}>
                        <BsSearch />
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search by name or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ borderRadius: '12px', borderLeft: 'none' }}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Status Filter</label>
                    <select
                      className="form-select"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      style={{ borderRadius: '12px' }}
                    >
                      <option value="All">All Statuses</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Sort By</label>
                    <select
                      className="form-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      style={{ borderRadius: '12px' }}
                    >
                      <option value="createdAt">Created Date</option>
                      <option value="dashboardName">Name</option>
                      <option value="grandTotal">Total Value</option>
                      <option value="status">Status</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    <button
                      className="btn btn-outline-secondary w-100"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      style={{ borderRadius: '12px' }}
                    >
                      {sortOrder === 'asc' ? <BsSortAlphaUp /> : <BsSortAlphaDown />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboards Table - Enhanced with actions */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: '20px', overflow: 'hidden' }}>
              <div className="card-header bg-transparent border-0 py-3">
                <h5 className="mb-0 fw-bold" style={{ color: '#d4af37' }}>
                  Financial Matrices
                </h5>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Name</th>
                        <th>ID</th>
                        <th>Status</th>
                        <th>Total Value</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedDashboards.length > 0 ? paginatedDashboards.map((dashboard) => (
                        <tr key={dashboard.dashboardId}>
                          <td>{dashboard.dashboardName}</td>
                          <td>{dashboard.dashboardId}</td>
                          <td>
                            <span className={`badge ${dashboard.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
                              {dashboard.status}
                            </span>
                          </td>
                          <td>{formatCurrency(dashboard.financialSummary?.grandTotal)}</td>
                          <td>{formatDate(dashboard.createdAt)}</td>
                          <td>
                            <div className="btn-group" role="group">
                              <button className="btn btn-sm btn-outline-primary" onClick={() => navigate(`/financial-dashboard/${dashboard._id}`)} title="View">
                                <BsEye />
                              </button>
                              <button className="btn btn-sm btn-outline-success" onClick={() => handleExport(dashboard._id, dashboard.dashboardName)} disabled={exporting} title="Export">
                                {exporting ? <span className="spinner-border spinner-border-sm" style={{width: '1rem', height: '1rem'}}></span> : <BsDownload />}
                              </button>
                              <button className="btn btn-sm btn-outline-info" onClick={() => handleShare(dashboard._id)} disabled={sharing} title="Share">
                                {sharing ? <span className="spinner-border spinner-border-sm" style={{width: '1rem', height: '1rem'}}></span> : <BsShare />}
                              </button>
                              <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteDashboard(dashboard._id, dashboard.dashboardName)} title="Delete">
                                <BsTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="6" className="text-center text-muted py-4">No dashboards found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-between align-items-center p-3 border-top">
                    <div className="text-muted small">
                      Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredDashboards.length)} of {filteredDashboards.length} entries
                    </div>
                    <nav>
                      <ul className="pagination pagination-sm mb-0">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                          <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>
                            <BsChevronLeft />
                          </button>
                        </li>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                            <button className="page-link" onClick={() => setCurrentPage(page)}>{page}</button>
                          </li>
                        ))}
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                          <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>
                            <BsChevronRight />
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Calculation Modal */}
      {showCalculationModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-xl" style={{
              borderRadius: '24px',
              overflow: 'hidden',
              background: 'linear-gradient(145deg, #ffffff 0%, #fdfcfb 100%)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 25px 80px rgba(0, 0, 0, 0.1), 0 1px 4px rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div className="modal-header border-0 bg-transparent py-4 px-5">
                <div className="d-flex align-items-center">
                  <div className="bg-gradient p-3 rounded-3 me-4" style={{
                    background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                    width: '60px',
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 25px rgba(212, 175, 55, 0.3)'
                  }}>
                    <BsCalculator className="text-black fs-5" />
                  </div>
                  <div className="w-100 text-center">
                    <h2 className="h3 fw-bold mb-1" style={{ color: "#111827" }}>
                      Fiscal Forge
                    </h2>
                    <p className="text-muted mb-0" style={{ fontSize: "0.95rem" }}>
                      Architect your financial matrix with granular precision
                    </p>
                  </div>
                </div>
                <button type="button" className="btn-close" onClick={() => setShowCalculationModal(false)}></button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); handleCalculateNewDashboard(); }}>
                <div className="modal-body p-5">
                  {/* Calculation Type - New */}
                  <div className="mb-4">
                    <label className="form-label fw-bold">
                      <span className="me-2">⚙️</span>
                      Analysis Paradigm
                    </label>
                    <div className="d-flex flex-wrap gap-2">
                      {[
                        { value: 'standard', label: 'Standard', icon: '📊', desc: 'Core metrics and summaries' },
                        { value: 'advanced', label: 'Advanced', icon: '🔬', desc: 'Deep analytics and correlations' },
                        { value: 'predictive', label: 'Predictive', icon: '🔮', desc: 'Forecasting and trends Visuals' }
                      ].map(type => (
                        <button
                          key={type.value}
                          type="button"
                          className={`btn btn-sm p-3 ${
                            calculationType === type.value 
                              ? 'btn-primary shadow-sm' 
                              : 'btn-outline-primary'
                          }`}
                          onClick={() => setCalculationType(type.value)}
                          style={{
                            borderRadius: '16px',
                            fontSize: '0.85rem',
                            transition: 'all 0.2s ease',
                            minWidth: '140px'
                          }}
                        >
                          <span className="me-1 d-block mb-1 fs-5">{type.icon}</span>
                          <strong>{type.label}</strong>
                          <small className="d-block">{type.desc}</small>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dashboard Name */}
                  <div className="mb-4">
                    <label className="form-label fw-bold">
                      <span className="me-2">📝</span>
                      Matrix Designation
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g., Q3 Revenue Synthesis"
                      value={dashboardName}
                      onChange={(e) => setDashboardName(e.target.value)}
                      style={{
                        borderRadius: '16px',
                        backgroundColor: '#fdfcfb',
                        padding: '1rem 1.25rem',
                        border: '1px solid #e5e7eb',
                        boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)',
                        transition: 'all 0.2s ease',
                        fontSize: '1rem'
                      }}
                      required
                    />
                  </div>

                  {/* Project Selection */}
                  <div className="mb-4">
                    <label className="form-label fw-bold">
                      <span className="me-2">🏢</span>
                      Project Constellation ({availableProjects.length} available)
                    </label>
                    <select
                      multiple
                      className="form-control"
                      value={selectedProjects}
                      onChange={(e) => setSelectedProjects(Array.from(e.target.selectedOptions, option => option.value))}
                      style={{
                        borderRadius: '16px',
                        backgroundColor: '#fdfcfb',
                        padding: '1rem',
                        border: '1px solid #e5e7eb',
                        height: '120px'
                      }}
                    >
                      {availableProjects.length > 0 ? availableProjects.map(project => (
                        <option key={project.code || project.id} value={project.code || project.id}>{project.name}</option>
                      )) : (
                        <option disabled>No projects loaded</option>
                      )}
                    </select>
                    <small className="form-text text-muted mt-1">
                      Hold Ctrl/Cmd to select multiple. Leave empty for all projects.
                    </small>
                  </div>

                  {/* Date Range Section - Premium */}
                  <div className="mb-4">
                    <label className="form-label fw-bold">
                      <span className="me-2">📅</span>
                      Temporal Vector
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
                            Quantum Temporal Calibration
                          </label>
                        </div>
                        <small className="text-muted">
                          Auto-calibrate optimal vectors for multidimensional synthesis
                        </small>
                      </div>
                    </div>

                    {/* Date Range Presets */}
                    {autoDateRange && (
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Temporal Presets</label>
                        <div className="d-flex flex-wrap gap-2">
                          {[
                            { value: 'last7days', label: '7 Cycles', icon: '📅' },
                            { value: 'last30days', label: '30 Cycles', icon: '📊' },
                            { value: 'last3months', label: 'Quarter', icon: '📈' },
                            { value: 'last6months', label: 'Semi-Annual', icon: '📉' },
                            { value: 'thismonth', label: 'Current Cycle', icon: '🗓️' },
                            { value: 'thisyear', label: 'Fiscal Year', icon: '📆' }
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
                            <label className="form-label fw-semibold small">Vector Origin</label>
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
                            <label className="form-label fw-semibold small">Vector Terminus</label>
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
                              Synthesis Span: {getDateRangeLabel(dateRangePreset)}
                              <br />
                              <span className="text-muted">
                                From {new Date(dateFrom).toLocaleDateString()} to {new Date(dateTo).toLocaleDateString()}
                                ({Math.ceil((new Date(dateTo) - new Date(dateFrom)) / (1000 * 60 * 60 * 24))} cycles)
                              </span>
                            </small>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <small className="form-text text-muted mt-2">
                      <span className="me-1">💡</span>
                      Quantum calibration yields optimal multidimensional vectors
                    </small>
                  </div>
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
                          <span className="me-1">✓</span> Matrix Name
                        </span>
                      ) : (
                        <span className="badge bg-secondary me-2">
                          <span className="me-1">•</span> Designation Required
                        </span>
                      )}
                      
                      {dateFrom && dateTo ? (
                        <span className="badge bg-success me-2">
                          <span className="me-1">✓</span> Temporal Span
                        </span>
                      ) : (
                        <span className="badge bg-info me-2">
                          <span className="me-1">📅</span> Quantum Calibration
                        </span>
                      )}
                      
                      {selectedProjects.length > 0 ? (
                        <span className="badge bg-primary">
                          <span className="me-1">🏢</span> {selectedProjects.length} Vectors
                        </span>
                      ) : (
                        <span className="badge bg-warning">
                          <span className="me-1">🌌</span> Omniverse Scope
                        </span>
                      )}
                    </div>
                    
                    <small className="text-muted">
                      <span className="me-2">💡</span>
                      {autoDateRange 
                        ? `Quantum synthesis for ${getDateRangeLabel(dateRangePreset).toLowerCase()}`
                        : 'Custom vector calibration'
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
                      <span className="me-2">✕</span> Abort
                    </button>
                    
                    <button 
                      type="submit" 
                      className="btn btn-lg shadow-lg"
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
                            Synthesizing Matrix...
                          </>
                        ) : (
                          <>
                            <span className="me-2">🔮</span> 
                            Crystallize Synthesis
                          </>
                        )}
                      </span>
                    </button>
                  </div>
                </div>
              </form>
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
        .fas.fa-chart-line:before { content: "\\f201"; }
        .fas.fa-dollar-sign:before { content: "\\f155"; }
        .fas.fa-calculator:before { content: "\\f1ec"; }
        .fas.fa-check-circle:before { content: "\\f058"; }
        .fas.fa-check:before { content: "\\f00c"; }
        .fas.fa-arrow-up:before { content: "\\f062"; }
        .fas.fa-star:before { content: "\\f005"; }
        .fas.fa-thumbs-up:before { content: "\\f164"; }
        .fas.fa-eye:before { content: "\\f06e"; }
        .fas.fa-edit:before { content: "\\f044"; }
        .fas.fa-trash:before { content: "\\f1f8"; }
        .fas.fa-search:before { content: "\\f002"; }
        .fas.fa-sort-amount-up:before { content: "\\f160"; }
        .fas.fa-sort-amount-down:before { content: "\\f161"; }
        
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

        .bg-purple { background-color: #6f42c1 !important; }
      `}</style>
    </div>
  );
}