import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

export default function TimelineView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTimeline = () => {
    setLoading(true);
    setError(null);
    
    axios
      .get(`http://localhost:5050/timelines/${id}`)
      .then((res) => {
        setTimeline(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching timeline:", err);
        setError("Failed to load timeline data");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTimeline();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const calculateTotalHours = (staff) => {
    if (!staff || !Array.isArray(staff)) return 0;
    return staff.reduce((total, person) => total + (parseInt(person.hoursWorked) || 0), 0);
  };

  const calculateTotalExpenses = (expenses) => {
    if (!expenses || !Array.isArray(expenses)) return 0;
    return expenses.reduce((total, expense) => total + (parseFloat(expense.amount) || 0), 0);
  };

  const calculateTotalMaterialCosts = (materials) => {
    if (!materials || !Array.isArray(materials)) return 0;
    return materials.reduce((total, material) => total + (parseFloat(material.cost) || 0), 0);
  };

  const getAllHours = () => {
    const workerHours = calculateTotalHours(timeline.tworker);
    const engineerHours = calculateTotalHours(timeline.tengineer);
    const architectHours = calculateTotalHours(timeline.tarchitect);
    return workerHours + engineerHours + architectHours;
  };

  const getTotalCost = () => {
    const expenseTotal = calculateTotalExpenses(timeline.texpenses);
    const materialTotal = calculateTotalMaterialCosts(timeline.tmaterials);
    return expenseTotal + materialTotal;
  };

  const handleDelete = async () => {
    if (window.confirm("⚠️ Are you sure you want to delete this timeline? This action cannot be undone.")) {
      try {
        await axios.delete(`http://localhost:5050/timelines/${id}`);
        
        // Show success message
        const alert = document.createElement('div');
        alert.className = 'alert alert-success alert-dismissible fade show position-fixed';
        alert.style.cssText = 'top: 20px; right: 20px; z-index: 1050; min-width: 300px;';
        alert.innerHTML = `
          <strong>✅ Success!</strong> Timeline deleted successfully.
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(alert);
        setTimeout(() => alert.remove(), 3000);
        
        navigate("/timelines");
      } catch (error) {
        console.error("Error deleting timeline:", error);
        alert("❌ Error deleting timeline. Please try again.");
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      full: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      short: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    };
  };

  const getStatusBadgeClass = (status) => {
    if (!status) return 'bg-secondary';
    
    if (status.includes('Available')) return 'bg-success';
    if (status.includes('In Use')) return 'bg-primary';
    if (status.includes('Maintenance')) return 'bg-warning text-dark';
    if (status.includes('Damaged')) return 'bg-danger';
    if (status.includes('Ordered')) return 'bg-info';
    if (status.includes('Out of Stock')) return 'bg-secondary';
    
    return 'bg-secondary';
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted fs-5">Loading timeline details...</p>
        </div>
      </div>
    );
  }

  if (error || !timeline) {
    return (
      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card border-danger">
              <div className="card-body text-center">
                <div className="mb-3">
                  <span style={{fontSize: '4rem', color: '#dc3545'}}>⚠️</span>
                </div>
                <h4 className="card-title text-danger">Timeline Not Found</h4>
                <p className="card-text text-muted">
                  {error || "The requested timeline could not be found or may have been deleted."}
                </p>
                <div className="mt-4">
                  <button 
                    className="btn btn-primary me-2"
                    onClick={() => navigate("/timelines")}
                  >
                    ← Back to Timelines
                  </button>
                  <button 
                    className="btn btn-outline-primary"
                    onClick={fetchTimeline}
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

  const formattedDate = formatDate(timeline.date);

  return (
    <div className="container mt-4">
      {/* Header Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-lg">
            <div className="card-header bg-gradient" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
              <div className="row align-items-center text-white">
                <div className="col-md-8">
                  <h1 className="mb-1 fw-bold">📋 Timeline Details</h1>
                  <div className="d-flex flex-wrap align-items-center">
                    <span className="badge bg-light text-dark me-3 fs-6 px-3 py-2">
                      📅 {formattedDate.short}
                    </span>
                    <span className="opacity-75 fs-6">{formattedDate.full}</span>
                  </div>
                </div>
                <div className="col-md-4 text-end">
                  <div className="btn-group">
                    <button 
                      className="btn btn-light btn-sm"
                      onClick={() => navigate(`/update-timeline/${id}`)}
                      title="Edit Timeline"
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      className="btn btn-outline-light btn-sm"
                      onClick={() => navigate("/timelines")}
                      title="Back to List"
                    >
                      ← Back
                    </button>
                    <button 
                      className="btn btn-outline-light btn-sm"
                      onClick={handleDelete}
                      title="Delete Timeline"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="row mb-4">
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center bg-primary bg-opacity-10">
              <div className="text-primary mb-2" style={{fontSize: '2.5rem'}}>👷</div>
              <h3 className="text-primary mb-1">{timeline.tworker?.length || 0}</h3>
              <p className="text-muted mb-1 fw-medium">Workers</p>
              <small className="text-primary">
                {calculateTotalHours(timeline.tworker)} hours total
              </small>
            </div>
          </div>
        </div>
        
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center bg-success bg-opacity-10">
              <div className="text-success mb-2" style={{fontSize: '2.5rem'}}>👨‍💼</div>
              <h3 className="text-success mb-1">{timeline.tengineer?.length || 0}</h3>
              <p className="text-muted mb-1 fw-medium">Engineers</p>
              <small className="text-success">
                {calculateTotalHours(timeline.tengineer)} hours total
              </small>
            </div>
          </div>
        </div>
        
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center bg-info bg-opacity-10">
              <div className="text-info mb-2" style={{fontSize: '2.5rem'}}>🏛️</div>
              <h3 className="text-info mb-1">{timeline.tarchitect?.length || 0}</h3>
              <p className="text-muted mb-1 fw-medium">Architects</p>
              <small className="text-info">
                {calculateTotalHours(timeline.tarchitect)} hours total
              </small>
            </div>
          </div>
        </div>
        
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center bg-warning bg-opacity-10">
              <div className="text-warning mb-2" style={{fontSize: '2.5rem'}}>⏱️</div>
              <h3 className="text-warning mb-1">{getAllHours()}</h3>
              <p className="text-muted mb-1 fw-medium">Total Hours</p>
              <small className="text-success fw-bold">
                ${getTotalCost().toLocaleString()} cost
              </small>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Staff Details */}
        <div className="col-lg-8">
          {/* Workers */}
          {timeline.tworker && timeline.tworker.length > 0 && (
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">👷 Workers ({timeline.tworker.length})</h5>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timeline.tworker.map((worker, index) => (
                        <tr key={index}>
                          <td className="fw-semibold">{worker.name || 'N/A'}</td>
                          <td>
                            <span className="badge bg-primary bg-opacity-25 text-primary">
                              {worker.role || 'No role specified'}
                            </span>
                          </td>
                          <td>
                            <span className="badge bg-success fs-6 px-2 py-1">
                              {worker.hoursWorked || 0}h
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Engineers */}
          {timeline.tengineer && timeline.tengineer.length > 0 && (
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-success text-white">
                <h5 className="mb-0">👨‍💼 Engineers ({timeline.tengineer.length})</h5>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Name</th>
                        <th>Specialty</th>
                        <th>Hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timeline.tengineer.map((engineer, index) => (
                        <tr key={index}>
                          <td className="fw-semibold">{engineer.name || 'N/A'}</td>
                          <td>
                            <span className="badge bg-success bg-opacity-25 text-success">
                              {engineer.specialty || 'No specialty specified'}
                            </span>
                          </td>
                          <td>
                            <span className="badge bg-success fs-6 px-2 py-1">
                              {engineer.hoursWorked || 0}h
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Architects */}
          {timeline.tarchitect && timeline.tarchitect.length > 0 && (
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-info text-white">
                <h5 className="mb-0">🏛️ Architects ({timeline.tarchitect.length})</h5>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Name</th>
                        <th>Specialty</th>
                        <th>Hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timeline.tarchitect.map((architect, index) => (
                        <tr key={index}>
                          <td className="fw-semibold">{architect.name || 'N/A'}</td>
                          <td>
                            <span className="badge bg-info bg-opacity-25 text-info">
                              {architect.specialty || 'No specialty specified'}
                            </span>
                          </td>
                          <td>
                            <span className="badge bg-info fs-6 px-2 py-1">
                              {architect.hoursWorked || 0}h
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Project Managers */}
          {timeline.tprojectManager && timeline.tprojectManager.length > 0 && (
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-warning text-dark">
                <h5 className="mb-0">📋 Project Managers ({timeline.tprojectManager.length})</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  {timeline.tprojectManager.map((manager, index) => (
                    <div key={index} className="col-md-6 mb-3">
                      <div className="card bg-warning bg-opacity-10 border-warning">
                        <div className="card-body">
                          <h6 className="card-title fw-bold">{manager.name || 'N/A'}</h6>
                          <p className="card-text text-muted mb-0">
                            📞 {manager.contact || 'No contact info'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Materials, Tools, etc. */}
        <div className="col-lg-4">
          {/* Materials */}
          {timeline.tmaterials && timeline.tmaterials.length > 0 && (
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-secondary text-white">
                <h6 className="mb-0">🧱 Materials ({timeline.tmaterials.length})</h6>
              </div>
              <div className="card-body p-2">
                <div className="list-group list-group-flush">
                  {timeline.tmaterials.map((material, index) => (
                    <div key={index} className="list-group-item px-2 py-2 border-0 bg-light bg-opacity-50 mb-1 rounded">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="flex-grow-1">
                          <small className="fw-semibold text-truncate d-block" style={{maxWidth: '180px'}}>
                            {material.name || 'Unknown Material'}
                          </small>
                          <small className="text-muted">
                            {material.quantity || 0} {material.unit || 'units'}
                          </small>
                        </div>
                        <span className="badge bg-success text-white ms-2">
                          ${parseFloat(material.cost || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-top pt-2 mt-2">
                  <div className="d-flex justify-content-between fw-bold">
                    <span>Total:</span>
                    <span className="text-success">
                      ${calculateTotalMaterialCosts(timeline.tmaterials).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tools */}
          {timeline.ttools && timeline.ttools.length > 0 && (
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-dark text-white">
                <h6 className="mb-0">🔧 Tools & Equipment ({timeline.ttools.length})</h6>
              </div>
              <div className="card-body p-2">
                <div className="list-group list-group-flush">
                  {timeline.ttools.map((tool, index) => (
                    <div key={index} className="list-group-item px-2 py-2 border-0 bg-light bg-opacity-50 mb-1 rounded">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <small className="fw-semibold text-truncate d-block" style={{maxWidth: '150px'}}>
                            {tool.name || 'Unknown Tool'}
                          </small>
                          <small className="text-muted">Qty: {tool.quantity || 0}</small>
                        </div>
                        <span className={`badge ${getStatusBadgeClass(tool.status)} ms-2`} style={{fontSize: '9px'}}>
                          {tool.status || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Expenses */}
          {timeline.texpenses && timeline.texpenses.length > 0 && (
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-danger text-white">
                <h6 className="mb-0">💰 Expenses ({timeline.texpenses.length})</h6>
              </div>
              <div className="card-body p-2">
                <div className="list-group list-group-flush">
                  {timeline.texpenses.map((expense, index) => (
                    <div key={index} className="list-group-item px-2 py-2 border-0 bg-light bg-opacity-50 mb-1 rounded">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <small className="fw-semibold text-truncate d-block" style={{maxWidth: '160px'}}>
                            {expense.description || 'No description'}
                          </small>
                          <small className="text-muted">
                            {expense.date ? new Date(expense.date).toLocaleDateString() : 'No date'}
                          </small>
                        </div>
                        <span className="badge bg-danger text-white ms-2">
                          ${parseFloat(expense.amount || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-top pt-2 mt-2">
                  <div className="d-flex justify-content-between fw-bold">
                    <span>Total:</span>
                    <span className="text-danger">
                      ${calculateTotalExpenses(timeline.texpenses).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notes Section */}
      {timeline.tnotes && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-header bg-light border-bottom">
                <h5 className="mb-0 text-muted">📝 Notes & Observations</h5>
              </div>
              <div className="card-body">
                <div className="p-3 bg-light bg-opacity-50 rounded border-start border-primary border-4">
                  <pre style={{
                    whiteSpace: 'pre-wrap', 
                    fontFamily: 'inherit', 
                    fontSize: '0.95rem',
                    lineHeight: '1.6',
                    margin: 0
                  }}>
                    {timeline.tnotes}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty States */}
      {(!timeline.tworker?.length && !timeline.tengineer?.length && !timeline.tarchitect?.length && 
        !timeline.tprojectManager?.length && !timeline.tmaterials?.length && !timeline.ttools?.length && 
        !timeline.texpenses?.length) && (
        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body text-center py-5">
                <div className="mb-3">
                  <span style={{fontSize: '4rem', opacity: 0.3}}>📋</span>
                </div>
                <h4 className="text-muted">No Activity Recorded</h4>
                <p className="text-muted">This timeline entry doesn't have any workers, materials, tools, or expenses recorded yet.</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate(`/update-timeline/${id}`)}
                >
                  ✏️ Add Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="row mt-4 mb-5">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body text-center py-4">
              <div className="btn-group" role="group">
                <button 
                  className="btn btn-primary btn-lg"
                  onClick={() => navigate(`/update-timeline/${id}`)}
                >
                  ✏️ Edit Timeline
                </button>
                <button 
                  className="btn btn-outline-primary btn-lg"
                  onClick={() => navigate("/timelines")}
                >
                  📋 All Timelines
                </button>
                <button 
                  className="btn btn-outline-secondary btn-lg"
                  onClick={() => window.print()}
                >
                  🖨️ Print
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .btn, .card-header .btn, .btn-group {
            display: none !important;
          }
          .card {
            border: 1px solid #dee2e6 !important;
            box-shadow: none !important;
            break-inside: avoid;
          }
          .card-header {
            background-color: #f8f9fa !important;
            color: #495057 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          body {
            font-size: 12px !important;
          }
          .container {
            max-width: 100% !important;
            margin: 0 !important;
            padding: 10px !important;
          }
          h1 { font-size: 18px !important; }
          h3 { font-size: 16px !important; }
          h5 { font-size: 14px !important; }
          .badge {
            border: 1px solid #dee2e6 !important;
          }
        }
      `}</style>
    </div>
  );
}