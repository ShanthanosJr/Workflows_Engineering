import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Nav from "../Nav/Nav";
import {
  BsCurrencyDollar,
  BsPeople,
  BsFileEarmarkBarGraph,
  BsChevronLeft,
  BsDownload,
  BsShare
} from "react-icons/bs";
// Add this import for our export utility
import { exportFinancialDashboardToPDF } from '../ExportUtils';

export default function FinancialDashboardView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching financial dashboard with ID:', id);
        
        // Add error handling for missing ID
        if (!id) {
          console.error('❌ No dashboard ID provided');
          setLoading(false);
          return;
        }
        
        const response = await axios.get(`http://localhost:5050/financial-dashboard/${id}`);
        const dashboardData = response.data.data;
        
        // Validate that we received dashboard data
        if (!dashboardData) {
          console.error('❌ No dashboard data received');
          setLoading(false);
          return;
        }
        
        setDashboard(dashboardData);
        console.log('✅ Loaded financial dashboard:', dashboardData);
      } catch (error) {
        console.error('❌ Error fetching dashboard:', error);
        console.error('❌ Error details:', error.response?.data || error.message);
        alert('Error loading financial dashboard. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDashboard();
    } else {
      setLoading(false);
    }
  }, [id]);

  const handleExport = async () => {
    setExporting(true);
    try {
      console.log('🔄 Exporting dashboard:', id);
      
      // Use our professional PDF export function
      if (dashboard) {
        exportFinancialDashboardToPDF(dashboard, `${dashboard.dashboardName}.pdf`);
        console.log('✅ PDF export successful');
      } else {
        // Fallback to backend export if PDF generation fails
        const response = await axios.get(`http://localhost:5050/financial-dashboard/${id}/export`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `financial-dashboard-${id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        console.log('✅ Export successful');
      }
    } catch (error) {
      console.error('❌ Export failed:', error);
      console.error('❌ Export error details:', error.response?.data || error.message);
      alert('Export failed: ' + (error.response?.data?.message || error.message || 'Unknown error'));
    } finally {
      setExporting(false);
    }
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      console.log('🔄 Sharing dashboard:', id);
      const response = await axios.post(`http://localhost:5050/financial-dashboard/${id}/share`);
      const shareUrl = response.data.shareUrl || `http://localhost:3000/financial-dashboard/${id}`;
      await navigator.clipboard.writeText(shareUrl);
      alert(`✅ Share URL copied: ${shareUrl}`);
    } catch (error) {
      console.error('❌ Share failed:', error);
      console.error('❌ Share error details:', error.response?.data || error.message);
      const shareUrl = `http://localhost:3000/financial-dashboard/${id}`;
      await navigator.clipboard.writeText(shareUrl);
      alert(`✅ Direct URL copied: ${shareUrl} (backend share unavailable)`);
    } finally {
      setSharing(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
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

  if (!dashboard) {
    return (
      <>
        <Nav />
        <div className="container mt-5">
          <div className="row justify-content-center">
            <div className="col-md-6 text-center">
              <div className="card shadow-lg border-0" style={{ borderRadius: '24px' }}>
                <div className="card-body p-5">
                  <h4 className="text-muted">Financial Dashboard Not Found</h4>
                  <p className="text-secondary">The requested financial dashboard could not be found.</p>
                  <button className="btn btn-primary" onClick={() => navigate('/financial-dashboard')}>
                    <BsChevronLeft className="me-2" />
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

  // Ensure financialSummary exists
  const financialSummary = dashboard.financialSummary || {};
  const projectBreakdown = dashboard.projectBreakdown || [];

  return (
    <div style={{ backgroundColor: '#fdfcfb', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <Nav />
      
      {/* Header */}
      <section className="container-fluid px-4 py-5" style={{
        background: 'linear-gradient(135deg, #fdfcfb 0%, #f8f7f4 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="row justify-content-center position-relative">
          <div className="col-lg-10">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <button 
                className="btn btn-outline-secondary btn-lg px-4 py-2 fw-semibold"
                onClick={() => navigate('/financial-dashboard')}
                style={{
                  borderRadius: '50px',
                  border: '2px solid #6c757d',
                  color: '#6c757d',
                  fontWeight: '600'
                }}
              >
                <BsChevronLeft className="me-2" />
                Back to Dashboards
              </button>
              
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-success btn-lg px-4 py-2 fw-semibold"
                  onClick={handleExport}
                  disabled={exporting}
                  style={{
                    borderRadius: '50px',
                    background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                    border: 'none',
                    color: '#fff',
                    fontWeight: '600'
                  }}
                >
                  {exporting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <BsDownload className="me-2" />
                      Export
                    </>
                  )}
                </button>
                
                <button 
                  className="btn btn-info btn-lg px-4 py-2 fw-semibold"
                  onClick={handleShare}
                  disabled={sharing}
                  style={{
                    borderRadius: '50px',
                    background: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)',
                    border: 'none',
                    color: '#fff',
                    fontWeight: '600'
                  }}
                >
                  {sharing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Sharing...
                    </>
                  ) : (
                    <>
                      <BsShare className="me-2" />
                      Share
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div className="text-center mb-5" style={{
              borderRadius: '24px',
              padding: '3rem 2rem',
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
                  <h1 className="display-4 fw-bold mb-1" style={{
                    color: '#1a1a1a',
                    fontWeight: '700',
                    letterSpacing: '-0.02em'
                  }}>{dashboard.dashboardName || 'Unnamed Dashboard'}</h1>
                  <p className="h5 text-muted mb-0" style={{ fontWeight: '300' }}>
                    Financial Analysis Dashboard
                  </p>
                </div>
              </div>
              <p className="lead mb-0" style={{
                color: '#6b7280',
                fontSize: '1.25rem',
                lineHeight: '1.6'
              }}>
                Generated on {formatDate(dashboard.calculationDate || dashboard.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mb-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            {/* Summary Cards */}
            <div className="row g-4 mb-5">
              <div className="col-lg-4 col-md-6">
                <div className="card border-0 shadow-sm h-100" style={{
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, rgba(0,123,255,0.1) 0%, rgba(0,123,255,0.05) 100%)'
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
                        <BsCurrencyDollar className="text-white" style={{fontSize: '1.8rem'}} />
                      </div>
                    </div>
                    <h3 className="fw-bold text-primary mb-1" style={{fontSize: '1.8rem'}}>{formatCurrency(financialSummary.grandTotal)}</h3>
                    <p className="text-muted mb-0 fw-semibold">Grand Total</p>
                  </div>
                </div>
              </div>
              
              <div className="col-lg-4 col-md-6">
                <div className="card border-0 shadow-sm h-100" style={{
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, rgba(40,167,69,0.1) 0%, rgba(40,167,69,0.05) 100%)'
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
                        <BsFileEarmarkBarGraph className="text-white" style={{fontSize: '1.8rem'}} />
                      </div>
                    </div>
                    <h3 className="fw-bold text-success mb-1" style={{fontSize: '1.8rem'}}>{financialSummary.projectCount || 0}</h3>
                    <p className="text-muted mb-0 fw-semibold">Projects Analyzed</p>
                  </div>
                </div>
              </div>
              
              <div className="col-lg-4 col-md-6">
                <div className="card border-0 shadow-sm h-100" style={{
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, rgba(23,162,184,0.1) 0%, rgba(23,162,184,0.05) 100%)'
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
                        <BsPeople className="text-white" style={{fontSize: '1.8rem'}} />
                      </div>
                    </div>
                    <h3 className="fw-bold text-info mb-1" style={{fontSize: '1.8rem'}}>{formatCurrency(financialSummary.averageProjectCost)}</h3>
                    <p className="text-muted mb-0 fw-semibold">Avg. Project Cost</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="card border-0 shadow-sm mb-5" style={{ borderRadius: '20px' }}>
              <div className="card-header bg-transparent border-0 py-3">
                <h5 className="mb-0 fw-bold" style={{ color: '#d4af37' }}>
                  Cost Breakdown
                </h5>
              </div>
              <div className="card-body p-4">
                <div className="row">
                  <div className="col-md-6 mb-4">
                    <h6>Labor Costs</h6>
                    <p className="h4 text-primary">{formatCurrency(dashboard.totalLaborCost)}</p>
                  </div>
                  <div className="col-md-6 mb-4">
                    <h6>Material Costs</h6>
                    <p className="h4 text-success">{formatCurrency(dashboard.totalMaterialCost)}</p>
                  </div>
                  <div className="col-md-6 mb-4">
                    <h6>Tool Costs</h6>
                    <p className="h4 text-info">{formatCurrency(dashboard.totalToolCost)}</p>
                  </div>
                  <div className="col-md-6 mb-4">
                    <h6>Expenses</h6>
                    <p className="h4 text-warning">{formatCurrency(dashboard.totalExpenses)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Breakdown */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: '20px' }}>
              <div className="card-header bg-transparent border-0 py-3">
                <h5 className="mb-0 fw-bold" style={{ color: '#d4af37' }}>
                  Project Breakdown
                </h5>
              </div>
              <div className="card-body p-0">
                {projectBreakdown.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Project</th>
                          <th>Type</th>
                          <th>Total Cost</th>
                          <th>Labor</th>
                          <th>Materials</th>
                          <th>Tools</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projectBreakdown.map((project, index) => (
                          <tr key={index}>
                            <td>
                              <strong>{project.projectName || project.projectCode}</strong>
                              <br />
                              <small className="text-muted">{project.projectCode}</small>
                            </td>
                            <td>{project.projectType || 'N/A'}</td>
                            <td className="fw-bold">{formatCurrency(project.totalCost)}</td>
                            <td>{formatCurrency(project.laborCost)}</td>
                            <td>{formatCurrency(project.materialCost)}</td>
                            <td>{formatCurrency(project.toolCost)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 text-center text-muted">
                    <p>No project data available for this dashboard.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}