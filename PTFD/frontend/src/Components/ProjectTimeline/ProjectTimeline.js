import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Nav from "../Nav/Nav";
import { exportTimelineToPDF } from '../ExportUtils';

export default function ProjectTimelines() {
  const navigate = useNavigate();

  // Debug logging
  useEffect(() => {
    console.log('📍 ProjectTimelines component mounted');
    console.log('🔍 Current URL:', window.location.href);
    console.log('🔍 Navigate function:', typeof navigate, navigate);
  }, [navigate]);

  const [timelines, setTimelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [filterProject, setFilterProject] = useState("");

  // Enhanced state for modern features
  const [viewMode, setViewMode] = useState("table"); // table, grid, timeline
  const [selectedTimelines, setSelectedTimelines] = useState([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  // Removed unused statusFilter state
  const [costRange, setCostRange] = useState({ min: "", max: "" });
  const [selectedTimelineDetail, setSelectedTimelineDetail] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [quickFilter, setQuickFilter] = useState("");
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetchTimelines();
  }, []);

  const fetchTimelines = () => {
    setLoading(true);
    axios.get("http://localhost:5050/project-timelines")
      .then((res) => {
        setTimelines(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this project timeline? This action cannot be undone.")) {
      try {
        await axios.delete(`http://localhost:5050/project-timelines/${id}`);
        setTimelines(timelines.filter(t => t._id !== id));
        setSelectedTimelines(selectedTimelines.filter(selectedId => selectedId !== id));

        showNotification("success", "Project timeline deleted successfully!");
      } catch (error) {
        console.error("Error deleting timeline:", error);
        showNotification("error", "Error deleting project timeline. Please try again.");
      }
    }
  };

  // Bulk delete function
  const handleBulkDelete = async () => {
    if (selectedTimelines.length === 0) {
      showNotification("warning", "Please select timelines to delete.");
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedTimelines.length} selected timeline(s)? This action cannot be undone.`)) {
      try {
        const deletePromises = selectedTimelines.map(id =>
          axios.delete(`http://localhost:5050/project-timelines/${id}`)
        );
        await Promise.all(deletePromises);

        setTimelines(timelines.filter(t => !selectedTimelines.includes(t._id)));
        setSelectedTimelines([]);
        showNotification("success", `${selectedTimelines.length} timeline(s) deleted successfully!`);
      } catch (error) {
        console.error("Error in bulk delete:", error);
        showNotification("error", "Error deleting some timelines. Please try again.");
      }
    }
  };

  // Enhanced notification system
  const showNotification = (type, message) => {
    const alertClass = {
      success: 'alert-success',
      error: 'alert-danger',
      warning: 'alert-warning',
      info: 'alert-info'
    }[type];

    const alert = document.createElement('div');
    alert.className = `alert ${alertClass} alert-dismissible fade show position-fixed`;
    alert.style.cssText = 'top: 20px; right: 20px; z-index: 1055; min-width: 350px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
    alert.innerHTML = `
      <div class="d-flex align-items-center">
        <div class="me-2">
          ${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}
        </div>
        <div>${message}</div>
        <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert"></button>
      </div>
    `;
    document.body.appendChild(alert);
    setTimeout(() => alert.remove(), 4000);
  };

  // Toggle timeline selection
  const toggleTimelineSelection = (timelineId) => {
    setSelectedTimelines(prev =>
      prev.includes(timelineId)
        ? prev.filter(id => id !== timelineId)
        : [...prev, timelineId]
    );
  };

  // Select all timelines
  const toggleSelectAll = () => {
    const filteredIds = getSortedAndFilteredTimelines().map(t => t._id);
    setSelectedTimelines(
      selectedTimelines.length === filteredIds.length ? [] : filteredIds
    );
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortedAndFilteredTimelines = () => {
    let filtered = timelines.filter(timeline => {
      // Search filter
      const matchesSearch =
        new Date(timeline.date).toLocaleDateString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        (timeline.tnotes && timeline.tnotes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (timeline.projectDetails?.pname && timeline.projectDetails.pname.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (timeline.pcode && timeline.pcode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (timeline.projectDetails?.pcode && timeline.projectDetails.pcode.toLowerCase().includes(searchTerm.toLowerCase()));

      // Project filter
      const matchesProject = !filterProject || timeline.pcode === filterProject;

      // Date range filter
      const matchesDateRange = (
        !dateRange.start || new Date(timeline.date) >= new Date(dateRange.start)
      ) && (
          !dateRange.end || new Date(timeline.date) <= new Date(dateRange.end)
        );

      // Cost range filter
      const timelineCost = calculateTotalCost(timeline);
      const matchesCostRange = (
        !costRange.min || timelineCost >= parseFloat(costRange.min)
      ) && (
          !costRange.max || timelineCost <= parseFloat(costRange.max)
        );

      // Quick filters
      const matchesQuickFilter = (() => {
        switch (quickFilter) {
          case 'today':
            return new Date(timeline.date).toDateString() === new Date().toDateString();
          case 'week':
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return new Date(timeline.date) >= weekAgo;
          case 'month':
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return new Date(timeline.date) >= monthAgo;
          case 'high-cost':
            return timelineCost > 10000;
          case 'high-activity':
            return (timeline.workerCount + timeline.tengineerCount + timeline.architectCount) > 10;
          default:
            return true;
        }
      })();

      return matchesSearch && matchesProject && matchesDateRange && matchesCostRange && matchesQuickFilter;
    });

    return filtered.sort((a, b) => {
      let aVal, bVal;

      switch (sortField) {
        case "date":
          aVal = new Date(a.date);
          bVal = new Date(b.date);
          break;
        case "project":
          aVal = a.projectDetails?.pname || a.pcode;
          bVal = b.projectDetails?.pname || b.pcode;
          break;
        case "workers":
          aVal = a.workerCount || 0;
          bVal = b.workerCount || 0;
          break;
        case "engineers":
          aVal = a.tengineerCount || 0;
          bVal = b.tengineerCount || 0;
          break;
        case "architects":
          aVal = a.architectCount || 0;
          bVal = b.architectCount || 0;
          break;
        case "expenses":
          aVal = calculateTotalCost(a);
          bVal = calculateTotalCost(b);
          break;
        case "hours":
          aVal = calculateTotalHours(a);
          bVal = calculateTotalHours(b);
          break;
        default:
          aVal = a[sortField];
          bVal = b[sortField];
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  };

  const calculateTotalCost = (timeline) => {
    const expensesTotal = timeline.texpenses?.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0) || 0;
    const materialsTotal = timeline.tmaterials?.reduce((sum, mat) => sum + (parseFloat(mat.cost) || 0), 0) || 0;
    return expensesTotal + materialsTotal;
  };

  const calculateTotalHours = (timeline) => {
    const workerHours = timeline.tworker?.reduce((sum, w) => sum + (parseInt(w.hoursWorked) || 0), 0) || 0;
    const engineerHours = timeline.tengineer?.reduce((sum, e) => sum + (parseInt(e.hoursWorked) || 0), 0) || 0;
    const architectHours = timeline.tarchitect?.reduce((sum, a) => sum + (parseInt(a.hoursWorked) || 0), 0) || 0;
    return workerHours + engineerHours + architectHours;
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return "↕️";
    return sortDirection === "asc" ? "⬆️" : "⬇️";
  };

  const getUniqueProjects = () => {
    const projects = timelines.map(t => ({
      id: t.pcode,
      name: t.projectDetails?.pname || t.pcode,
      code: t.pcode
    }));
    return [...new Map(projects.map(p => [p.id, p])).values()];
  };

  // Enhanced utility functions
  const clearAllFilters = () => {
    setSearchTerm("");
    setFilterProject("");
    setDateRange({ start: "", end: "" });
    setCostRange({ min: "", max: "" });
    setQuickFilter("");
    setCurrentPage(1);
  };

  const exportToCSV = () => {
    setExportLoading(true);

    const headers = [
      'Date', 'Project Code', 'Project Name', 'Workers', 'Engineers',
      'Architects', 'Total Hours', 'Total Cost', 'Notes'
    ];

    const data = getSortedAndFilteredTimelines().map(timeline => [
      new Date(timeline.date).toLocaleDateString(),
      timeline.pcode,
      timeline.projectDetails?.pname || 'N/A',
      timeline.workerCount || 0,
      timeline.tengineerCount || 0,
      timeline.architectCount || 0,
      calculateTotalHours(timeline),
      calculateTotalCost(timeline),
      timeline.tnotes || 'No notes'
    ]);

    const csvContent = [headers, ...data]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `project-timelines-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setExportLoading(false);
      showNotification('success', 'Data exported successfully!');
    }, 1000);
  };

  const openDetailModal = (timeline) => {
    setSelectedTimelineDetail(timeline);
    setShowDetailModal(true);
  };

  // Pagination
  const getPaginatedData = () => {
    const sorted = getSortedAndFilteredTimelines();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return {
      data: sorted.slice(startIndex, endIndex),
      totalItems: sorted.length,
      totalPages: Math.ceil(sorted.length / itemsPerPage)
    };
  };

  if (loading) {
    return (
      <>
        <Nav />
        <div className="container-fluid mt-4">
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
            <div className="text-center">
              <div className="spinner-border text-primary mb-3" style={{ width: '4rem', height: '4rem' }} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <h5 className="text-muted">Loading Timeline Dashboard...</h5>
              <p className="text-muted small">Fetching project timeline records</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Removed unused sortedTimelines variable
  const uniqueProjects = getUniqueProjects();
  const paginatedData = getPaginatedData();

  return (
    <div className="timeline-dashboard">
      <Nav />

      {/* Modern Header Section */}
      <div className="bg-gradient" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '2rem 0'
      }}>
        <div className="container-fluid">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <h1 className="display-5 fw-bold mb-2">📈 Project Timeline Dashboard</h1>
              <p className="lead mb-0 opacity-90">
                Advanced project activity tracking and resource management system
              </p>
            </div>
            <div className="col-lg-4" style={{ position: 'relative', zIndex: 1000 }}>
              {/* Primary Add Button */}
              <button
                className="btn btn-light btn-lg shadow-sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🔴 Add New Timeline Button Clicked!');

                  try {
                    navigate('/add-project-timeline');
                    console.log('✅ Navigation successful');
                  } catch (error) {
                    console.error('❌ Navigation error:', error);
                    // Fallback to window.location
                    window.location.href = '/add-project-timeline';
                  }
                }}
                style={{
                  borderRadius: '50px',
                  padding: '12px 30px',
                  cursor: 'pointer',
                  pointerEvents: 'auto',
                  position: 'relative',
                  zIndex: 1001
                }}
                type="button"
              >
                <span className="me-2">➕</span> Add New Timeline
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Statistics Dashboard */}
      <div className="container-fluid mt-4">
        <div className="row g-4 mb-4">
          <div className="col-xl-3 col-md-6">
            <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #3b82f6' }}>
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                      <span style={{ fontSize: '1.5rem' }}>📈</span>
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h6 className="text-muted mb-1">Total Records</h6>
                    <h3 className="mb-0 text-primary">{timelines.length}</h3>
                    <small className="text-success">
                      <span className="me-1">↑</span>
                      Active tracking
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6">
            <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #10b981' }}>
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <div className="bg-success bg-opacity-10 rounded-circle p-3">
                      <span style={{ fontSize: '1.5rem' }}>🏢</span>
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h6 className="text-muted mb-1">Active Projects</h6>
                    <h3 className="mb-0 text-success">{uniqueProjects.length}</h3>
                    <small className="text-info">
                      <span className="me-1">📁</span>
                      {uniqueProjects.length > 0 ? 'Multiple sites' : 'No projects'}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6">
            <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #f59e0b' }}>
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <div className="bg-warning bg-opacity-10 rounded-circle p-3">
                      <span style={{ fontSize: '1.5rem' }}>⏱️</span>
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h6 className="text-muted mb-1">Total Hours</h6>
                    <h3 className="mb-0 text-warning">
                      {timelines.reduce((sum, t) => sum + calculateTotalHours(t), 0).toLocaleString()}
                    </h3>
                    <small className="text-muted">
                      <span className="me-1">👥</span>
                      Workforce activity
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6">
            <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #ef4444' }}>
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <div className="bg-danger bg-opacity-10 rounded-circle p-3">
                      <span style={{ fontSize: '1.5rem' }}>💰</span>
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h6 className="text-muted mb-1">Total Investment</h6>
                    <h3 className="mb-0 text-danger">
                      ${timelines.reduce((sum, t) => sum + calculateTotalCost(t), 0).toLocaleString()}
                    </h3>
                    <small className="text-success">
                      <span className="me-1">📈</span>
                      Budget tracking
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Search and Filter Panel */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                {/* Quick Actions Bar */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="d-flex gap-2">
                    <button
                      className={`btn btn-sm ${quickFilter === 'today' ? 'btn-primary' : 'btn-outline-primary'
                        }`}
                      onClick={() => setQuickFilter(quickFilter === 'today' ? '' : 'today')}
                    >
                      📅 Today
                    </button>
                    <button
                      className={`btn btn-sm ${quickFilter === 'week' ? 'btn-success' : 'btn-outline-success'
                        }`}
                      onClick={() => setQuickFilter(quickFilter === 'week' ? '' : 'week')}
                    >
                      📆 This Week
                    </button>
                    <button
                      className={`btn btn-sm ${quickFilter === 'month' ? 'btn-info' : 'btn-outline-info'
                        }`}
                      onClick={() => setQuickFilter(quickFilter === 'month' ? '' : 'month')}
                    >
                      📅 This Month
                    </button>
                    <button
                      className={`btn btn-sm ${quickFilter === 'high-cost' ? 'btn-warning' : 'btn-outline-warning'
                        }`}
                      onClick={() => setQuickFilter(quickFilter === 'high-cost' ? '' : 'high-cost')}
                    >
                      💰 High Cost
                    </button>
                    <button
                      className={`btn btn-sm ${quickFilter === 'high-activity' ? 'btn-danger' : 'btn-outline-danger'
                        }`}
                      onClick={() => setQuickFilter(quickFilter === 'high-activity' ? '' : 'high-activity')}
                    >
                      👥 High Activity
                    </button>
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    >
                      <span className="me-1">🔧</span>
                      {showAdvancedFilters ? 'Hide' : 'Advanced'} Filters
                    </button>
                    <button
                      className="btn btn-outline-info btn-sm"
                      onClick={clearAllFilters}
                    >
                      <span className="me-1">🧹</span> Clear All
                    </button>
                  </div>
                </div>

                {/* Main Search and Filter Row */}
                <div className="row g-3 mb-3">
                  <div className="col-lg-4">
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <span style={{ fontSize: '1.1rem' }}>🔍</span>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0 ps-0"
                        placeholder="Search projects, dates, notes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ boxShadow: 'none' }}
                      />
                      {searchTerm && (
                        <button
                          className="btn btn-outline-secondary border-start-0"
                          onClick={() => setSearchTerm("")}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="col-lg-3">
                    <select
                      className="form-select"
                      value={filterProject}
                      onChange={(e) => setFilterProject(e.target.value)}
                    >
                      <option value="">🏢 All Projects ({uniqueProjects.length})</option>
                      {uniqueProjects.map(project => (
                        <option key={project.id} value={project.id}>
                          {project.name} ({timelines.filter(t => t.pcode === project.id).length})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-lg-2">
                    <select
                      className="form-select"
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(parseInt(e.target.value));
                        setCurrentPage(1);
                      }}
                    >
                      <option value={10}>Show 10</option>
                      <option value={25}>Show 25</option>
                      <option value={50}>Show 50</option>
                      <option value={100}>Show 100</option>
                    </select>
                  </div>

                  <div className="col-lg-3">
                    <div className="btn-group w-100" role="group">
                      <button
                        className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'
                          }`}
                        onClick={() => setViewMode('table')}
                      >
                        📋 Table
                      </button>
                      <button
                        className="btn btn-outline-success"
                        onClick={exportToCSV}
                        disabled={exportLoading}
                      >
                        {exportLoading ? (
                          <span className="spinner-border spinner-border-sm me-1"></span>
                        ) : (
                          <span className="me-1">📄</span>
                        )}
                        Export
                      </button>
                    </div>
                  </div>
                </div>

                {/* Advanced Filters - Collapsible */}
                {showAdvancedFilters && (
                  <div className="border-top pt-4 mt-4">
                    <h6 className="text-muted mb-3">
                      <span className="me-2">🔧</span>Advanced Filters
                    </h6>
                    <div className="row g-3">
                      <div className="col-lg-3">
                        <label className="form-label small text-muted">Date Range Start</label>
                        <input
                          type="date"
                          className="form-control"
                          value={dateRange.start}
                          onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        />
                      </div>
                      <div className="col-lg-3">
                        <label className="form-label small text-muted">Date Range End</label>
                        <input
                          type="date"
                          className="form-control"
                          value={dateRange.end}
                          onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        />
                      </div>
                      <div className="col-lg-3">
                        <label className="form-label small text-muted">Min Cost ($)</label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="0"
                          value={costRange.min}
                          onChange={(e) => setCostRange({ ...costRange, min: e.target.value })}
                        />
                      </div>
                      <div className="col-lg-3">
                        <label className="form-label small text-muted">Max Cost ($)</label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="∞"
                          value={costRange.max}
                          onChange={(e) => setCostRange({ ...costRange, max: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Results Summary */}
                <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                  <div className="d-flex align-items-center gap-3">
                    <span className="text-muted small">
                      📄 Showing {paginatedData.data.length} of {paginatedData.totalItems} records
                    </span>
                    {selectedTimelines.length > 0 && (
                      <>
                        <span className="badge bg-primary">
                          {selectedTimelines.length} selected
                        </span>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={handleBulkDelete}
                        >
                          <span className="me-1">🗑️</span>
                          Delete Selected
                        </button>
                      </>
                    )}
                  </div>
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={fetchTimelines}
                  >
                    <span className="me-1">🔄</span> Refresh
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Timeline Records Table */}
        <div className="container-fluid">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 d-flex align-items-center">
                  <span className="me-2">📈</span>
                  Project Timeline Records
                </h5>
                <div className="d-flex gap-2">
                  <span className="badge bg-light text-dark fs-6">
                    Page {currentPage} of {paginatedData.totalPages}
                  </span>
                </div>
              </div>
            </div>

            <div className="card-body p-0">
              {paginatedData.totalItems === 0 ? (
                <div className="text-center py-5">
                  <div className="mb-4">
                    <span style={{ fontSize: '4rem', opacity: 0.3 }}>📎</span>
                  </div>
                  <h4 className="text-muted mb-3">No timeline records found</h4>
                  <p className="text-muted mb-4">
                    {searchTerm || filterProject || quickFilter || dateRange.start || dateRange.end || costRange.min || costRange.max
                      ? 'Try adjusting your search criteria or filters.'
                      : 'Start by creating your first project timeline entry.'}
                  </p>
                  {!searchTerm && !filterProject && !quickFilter && (
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={() => navigate("/add-project-timeline")}
                      style={{ borderRadius: '50px', padding: '12px 30px' }}
                    >
                      <span className="me-2">✨</span>
                      Create First Timeline
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-dark">
                        <tr>
                          <th style={{ width: '50px' }}>
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={selectedTimelines.length === paginatedData.data.length && paginatedData.data.length > 0}
                                onChange={toggleSelectAll}
                              />
                            </div>
                          </th>
                          <th
                            style={{ cursor: 'pointer', userSelect: 'none', minWidth: '140px' }}
                            onClick={() => handleSort("date")}
                          >
                            <div className="d-flex align-items-center">
                              <span className="me-2">📅</span>
                              Date {getSortIcon("date")}
                            </div>
                          </th>
                          <th
                            style={{ cursor: 'pointer', userSelect: 'none', minWidth: '200px' }}
                            onClick={() => handleSort("project")}
                          >
                            <div className="d-flex align-items-center">
                              <span className="me-2">🏢</span>
                              Project {getSortIcon("project")}
                            </div>
                          </th>
                          <th
                            style={{ cursor: 'pointer', userSelect: 'none', textAlign: 'center' }}
                            onClick={() => handleSort("workers")}
                          >
                            <div className="d-flex align-items-center justify-content-center">
                              <span className="me-1">👷</span>
                              Workers {getSortIcon("workers")}
                            </div>
                          </th>
                          <th
                            style={{ cursor: 'pointer', userSelect: 'none', textAlign: 'center' }}
                            onClick={() => handleSort("engineers")}
                          >
                            <div className="d-flex align-items-center justify-content-center">
                              <span className="me-1">👨‍💼</span>
                              Engineers {getSortIcon("engineers")}
                            </div>
                          </th>
                          <th
                            style={{ cursor: 'pointer', userSelect: 'none', textAlign: 'center' }}
                            onClick={() => handleSort("architects")}
                          >
                            <div className="d-flex align-items-center justify-content-center">
                              <span className="me-1">🏗️</span>
                              Architects {getSortIcon("architects")}
                            </div>
                          </th>
                          <th
                            style={{ cursor: 'pointer', userSelect: 'none', textAlign: 'center' }}
                            onClick={() => handleSort("hours")}
                          >
                            <div className="d-flex align-items-center justify-content-center">
                              <span className="me-1">⏱️</span>
                              Hours {getSortIcon("hours")}
                            </div>
                          </th>
                          <th
                            style={{ cursor: 'pointer', userSelect: 'none', textAlign: 'center' }}
                            onClick={() => handleSort("expenses")}
                          >
                            <div className="d-flex align-items-center justify-content-center">
                              <span className="me-1">💰</span>
                              Cost {getSortIcon("expenses")}
                            </div>
                          </th>
                          <th style={{ minWidth: '150px' }}>
                            <span className="me-1">📝</span>Notes
                          </th>
                          <th style={{ width: '140px', textAlign: 'center' }}>
                            <span className="me-1">🔧</span>Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedData.data.map(timeline => (
                          <tr
                            key={timeline._id}
                            className={selectedTimelines.includes(timeline._id) ? 'table-active' : ''}
                            style={{ cursor: 'pointer' }}
                            onDoubleClick={() => openDetailModal(timeline)}
                          >
                            <td>
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  checked={selectedTimelines.includes(timeline._id)}
                                  onChange={() => toggleTimelineSelection(timeline._id)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                            </td>
                            <td>
                              <div className="d-flex flex-column">
                                <strong className="text-primary">
                                  {new Date(timeline.date).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </strong>
                                <small className="text-muted">
                                  {new Date(timeline.date).toLocaleDateString('en-US', { weekday: 'long' })}
                                </small>
                              </div>
                            </td>
                            <td>
                              <div className="d-flex flex-column">
                                <strong className="text-dark">
                                  {timeline.projectDetails?.pname || 'Unknown Project'}
                                </strong>
                                <small className="text-muted">
                                  Code: {timeline.pcode}
                                </small>
                                <small className="text-muted">
                                  Number: {timeline.projectDetails?.pnumber || 'N/A'}
                                </small>
                                <div className="mt-1">
                                  <span className={`badge ${timeline.projectDetails?.pstatus === 'Active' ? 'bg-success' :
                                      timeline.projectDetails?.pstatus === 'Completed' ? 'bg-primary' :
                                        timeline.projectDetails?.pstatus === 'On Hold' ? 'bg-warning' :
                                          'bg-secondary'
                                    } bg-opacity-10 text-dark`}>
                                    {timeline.projectDetails?.pstatus || 'Unknown'}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="text-center">
                              <span className={`badge fs-6 ${(timeline.workerCount || 0) > 5 ? 'bg-success' :
                                  (timeline.workerCount || 0) > 2 ? 'bg-warning' : 'bg-light text-dark'
                                }`}>
                                {timeline.workerCount || 0}
                              </span>
                            </td>
                            <td className="text-center">
                              <span className={`badge fs-6 ${(timeline.tengineerCount || 0) > 3 ? 'bg-info' :
                                  (timeline.tengineerCount || 0) > 1 ? 'bg-primary' : 'bg-light text-dark'
                                }`}>
                                {timeline.tengineerCount || 0}
                              </span>
                            </td>
                            <td className="text-center">
                              <span className={`badge fs-6 ${(timeline.architectCount || 0) > 2 ? 'bg-danger' :
                                  (timeline.architectCount || 0) > 0 ? 'bg-warning' : 'bg-light text-dark'
                                }`}>
                                {timeline.architectCount || 0}
                              </span>
                            </td>
                            <td className="text-center">
                              <span className={`badge text-dark fs-6 ${calculateTotalHours(timeline) > 40 ? 'bg-warning' :
                                  calculateTotalHours(timeline) > 20 ? 'bg-info' : 'bg-light'
                                }`}>
                                {calculateTotalHours(timeline)}h
                              </span>
                            </td>
                            <td className="text-center">
                              <span className={`fw-bold ${calculateTotalCost(timeline) > 10000 ? 'text-danger' :
                                  calculateTotalCost(timeline) > 5000 ? 'text-warning' : 'text-success'
                                }`}>
                                ${calculateTotalCost(timeline).toLocaleString()}
                              </span>
                            </td>
                            <td>
                              {timeline.tnotes ? (
                                <div
                                  className="text-truncate"
                                  style={{ maxWidth: '150px' }}
                                  title={timeline.tnotes}
                                >
                                  <small>{timeline.tnotes}</small>
                                </div>
                              ) : (
                                <span className="text-muted">
                                  <small>No notes</small>
                                </span>
                              )}
                            </td>
                            <td>
                              <div className="btn-group" role="group">
                                <button
                                  className="btn btn-outline-info btn-sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openDetailModal(timeline);
                                  }}
                                  title="View Details"
                                >
                                  👁️
                                </button>
                                <button
                                  className="btn btn-outline-success btn-sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    exportTimelineToPDF(timeline, `timeline-${timeline.pcode}-${new Date(timeline.date).toISOString().split('T')[0]}.pdf`);
                                  }}
                                  title="Export Timeline"
                                >
                                  📄
                                </button>
                                <button
                                  className="btn btn-outline-warning btn-sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/update-project-timeline/${timeline._id}`);
                                  }}
                                  title="Edit Timeline"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(timeline._id);
                                  }}
                                  className="btn btn-outline-danger btn-sm"
                                  title="Delete Timeline"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Enhanced Pagination */}
                  {paginatedData.totalPages > 1 && (
                    <div className="d-flex justify-content-between align-items-center p-4 border-top bg-light">
                      <div className="d-flex align-items-center gap-3">
                        <span className="text-muted small">
                          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, paginatedData.totalItems)} of {paginatedData.totalItems} entries
                        </span>
                      </div>

                      <nav aria-label="Timeline pagination">
                        <ul className="pagination pagination-sm mb-0">
                          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button
                              className="page-link"
                              onClick={() => setCurrentPage(1)}
                              disabled={currentPage === 1}
                            >
                              ⏮️
                            </button>
                          </li>
                          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button
                              className="page-link"
                              onClick={() => setCurrentPage(currentPage - 1)}
                              disabled={currentPage === 1}
                            >
                              ⬅️
                            </button>
                          </li>

                          {[...Array(Math.min(5, paginatedData.totalPages))].map((_, index) => {
                            const pageNumber = Math.max(1, Math.min(
                              paginatedData.totalPages - 4,
                              currentPage - 2
                            )) + index;

                            if (pageNumber <= paginatedData.totalPages) {
                              return (
                                <li key={pageNumber} className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}>
                                  <button
                                    className="page-link"
                                    onClick={() => setCurrentPage(pageNumber)}
                                  >
                                    {pageNumber}
                                  </button>
                                </li>
                              );
                            }
                            return null;
                          })}

                          <li className={`page-item ${currentPage === paginatedData.totalPages ? 'disabled' : ''}`}>
                            <button
                              className="page-link"
                              onClick={() => setCurrentPage(currentPage + 1)}
                              disabled={currentPage === paginatedData.totalPages}
                            >
                              ➡️
                            </button>
                          </li>
                          <li className={`page-item ${currentPage === paginatedData.totalPages ? 'disabled' : ''}`}>
                            <button
                              className="page-link"
                              onClick={() => setCurrentPage(paginatedData.totalPages)}
                              disabled={currentPage === paginatedData.totalPages}
                            >
                              ⏭️
                            </button>
                          </li>
                        </ul>
                      </nav>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

        {/* Detailed Timeline Modal */}
        {showDetailModal && selectedTimelineDetail && (
          <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-xl modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '20px', background: '#fffbea' }}>

                  {/* Header */}
                  <div className="modal-header border-0" style={{ background: '#fff9e6', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
                    <h5 className="modal-title fw-bold" style={{ color: '#111827' }}>
                      📋 Timeline Details – {new Date(selectedTimelineDetail.date).toLocaleDateString()}
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowDetailModal(false)}
                    ></button>
                  </div>

                  {/* Body */}
                  <div className="modal-body p-4">
                    <div className="row g-4">

                      {/* Project Information */}
                      <div className="col-md-6">
                        <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px', background: '#ffffff' }}>
                          <div className="card-body">
                            <h6 className="fw-bold mb-3" style={{ color: '#374151' }}>🏢 Project Information</h6>
                            <div className="row">
                              <div className="col-sm-6">
                                <small className="text-muted">Project Name</small>
                                <p className="fw-semibold">{selectedTimelineDetail.projectDetails?.pname || 'N/A'}</p>
                              </div>
                              <div className="col-sm-6">
                                <small className="text-muted">Project ID</small>
                                <p className="fw-semibold">{selectedTimelineDetail.pId}</p>
                              </div>
                              <div className="col-sm-6">
                                <small className="text-muted">Owner</small>
                                <p className="fw-semibold">{selectedTimelineDetail.projectDetails?.powner || 'N/A'}</p>
                              </div>
                              <div className="col-sm-6">
                                <small className="text-muted">Status</small>
                                <p>
                                  <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: '#facc15', color: '#111827' }}>
                                    {selectedTimelineDetail.projectDetails?.pstatus || 'N/A'}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Summary Statistics */}
                      <div className="col-md-6">
                        <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px', background: '#ffffff' }}>
                          <div className="card-body text-center">
                            <h6 className="fw-bold mb-3" style={{ color: '#374151' }}>📊 Summary Statistics</h6>
                            <div className="row">
                              <div className="col-6 mb-3">
                                <h4 className="fw-bold text-yellow-600">{selectedTimelineDetail.workerCount || 0}</h4>
                                <small className="text-muted">Workers</small>
                              </div>
                              <div className="col-6 mb-3">
                                <h4 className="fw-bold text-green-600">{selectedTimelineDetail.tengineerCount || 0}</h4>
                                <small className="text-muted">Engineers</small>
                              </div>
                              <div className="col-6">
                                <h4 className="fw-bold text-blue-500">{selectedTimelineDetail.architectCount || 0}</h4>
                                <small className="text-muted">Architects</small>
                              </div>
                              <div className="col-6">
                                <h4 className="fw-bold text-orange-500">{calculateTotalHours(selectedTimelineDetail)}h</h4>
                                <small className="text-muted">Total Hours</small>
                              </div>
                            </div>
                            <div className="mt-4 pt-3 border-top">
                              <h4 className="fw-bold text-red-500">
                                ${calculateTotalCost(selectedTimelineDetail).toLocaleString()}
                              </h4>
                              <small className="text-muted">Total Cost</small>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Notes Section */}
                      {selectedTimelineDetail.tnotes && (
                        <div className="col-12">
                          <div className="card border-0 shadow-sm" style={{ borderRadius: '16px', background: '#ffffff' }}>
                            <div className="card-body">
                              <h6 className="fw-bold mb-2" style={{ color: '#374151' }}>📝 Notes</h6>
                              <p className="text-muted">{selectedTimelineDetail.tnotes}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="modal-footer border-0">
                    <button
                      type="button"
                      className="btn btn-light border rounded-pill px-4"
                      onClick={() => setShowDetailModal(false)}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      className="btn btn-warning rounded-pill px-4 fw-bold"
                      onClick={() => {
                        setShowDetailModal(false);
                        navigate(`/update-project-timeline/${selectedTimelineDetail._id}`);
                      }}
                    >
                      ✏️ Edit Timeline
                    </button>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* Modern Footer */}
          <div className="mt-5 py-4 border-top bg-light">
            <div className="text-center">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <p className="mb-0 text-muted">
                    <small>
                      💡 <strong>Tips:</strong> Double-click rows for quick details • Use filters for precise searches •
                      Export data for external analysis
                    </small>
                  </p>
                </div>
                <div className="col-md-6 text-end">
                  <div className="d-flex justify-content-end gap-2">
                    <span className="badge bg-primary">
                      {paginatedData.totalItems} Total Records
                    </span>
                    <span className="badge bg-success">
                      {uniqueProjects.length} Projects
                    </span>
                    <span className="badge bg-info">
                      ${timelines.reduce((sum, t) => sum + calculateTotalCost(t), 0).toLocaleString()} Total Value
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
