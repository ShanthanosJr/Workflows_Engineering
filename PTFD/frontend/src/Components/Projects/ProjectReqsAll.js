import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Nav from '../Nav/Nav';
import { useNavigate } from "react-router-dom";
import {
    BsSearch,
    BsBuilding,

    BsGrid,
    BsList,
    BsTrash,
    BsEye,
    BsEnvelope,
    BsTelephone,
    BsCalendar,
    BsFileText
} from 'react-icons/bs';

const URL = 'http://localhost:5050/project-requests';

async function fetchProjectReqs() {
    try {
        const res = await axios.get(URL);
        return Array.isArray(res.data.projectReqs) ? res.data.projectReqs : [];
    } catch (err) {
        console.error('Error fetching project requests:', err);
        return [];
    }
}

export default function ProjectReqsAll() {
    const navigate = useNavigate();
    const [projectReqs, setProjectReqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState("card");
    const [selectedReq, setSelectedReq] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        let mounted = true;
        (async () => {
            setLoading(true);
            const data = await fetchProjectReqs();
            if (!mounted) return;
            setProjectReqs(data || []);
            setLoading(false);
        })();
        return () => { mounted = false; };
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("⚠️ Are you sure you want to delete this project request? This action cannot be undone.")) {
            try {
                await axios.delete(`${URL}/${id}`);
                setProjectReqs((prev) => prev.filter((p) => p._id !== id));
                const alert = document.createElement('div');
                alert.className = 'alert alert-success alert-dismissible fade show position-fixed';
                alert.style.cssText = 'top: 20px; right: 20px; z-index: 1050; min-width: 300px;';
                alert.innerHTML = `
          <strong>✅ Success!</strong> Project request deleted successfully.
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
                document.body.appendChild(alert);
                setTimeout(() => alert.remove(), 3000);
            } catch (error) {
                console.error("Error deleting project request:", error);
                alert("❌ Error deleting project request. Please try again.");
            }
        }
    };

    const openDetailModal = (req) => {
        setSelectedReq(req);
        setShowModal(true);
    };

    const getFilteredReqs = () => {
        return projectReqs.filter(req => {
            const matchesSearch = (
                (req.preqname && req.preqname.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (req.preqmail && req.preqmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (req.preqnumber && req.preqnumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (req.preqdescription && req.preqdescription.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            return matchesSearch;
        });
    };

    const filteredReqs = getFilteredReqs();

    if (loading) {
        return (
            <div>
                <Nav />
                <div className="container mt-4">
                    <div className="text-center">
                        <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3 text-muted">Loading project requests...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Nav />
            <div className="container-fluid mt-4">
                <style>{`
          .card-hover { transition: all 0.3s ease; }
          .card-hover:hover { transform: translateY(-5px); box-shadow: 0 8px 25px rgba(0,0,0,0.15); }
          .status-badge { padding: 0.5em 0.75em; border-radius: 20px; font-weight: 500; }
        `}</style>

                {/* Header */}
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
                                        background: 'linear-gradient(135deg, #1e8449 0%, #27ae60 100%)',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 8px 25px rgba(212, 175, 55, 0.3)',
                                        marginRight: '1rem'
                                    }}>
                                        <BsFileText className="text-white fs-1" />
                                    </div>
                                    <div>
                                        <h1 className="display-3 fw-bold mb-1" style={{
                                            color: '#1a1a1a',
                                            fontWeight: '700',
                                            letterSpacing: '-0.02em'
                                        }}>Project Requests</h1>
                                        <p className="h5 text-muted mb-0" style={{ fontWeight: '300' }}>
                                            Manage incoming construction project inquiries
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
                                    View, manage, and respond to project requests submitted by potential clients. Track all inquiries in one centralized location.
                                </p>
                                <div className="d-flex justify-content-center gap-3 flex-wrap">
                                    <button onClick={() => navigate("/project-timelines")} className="btn btn-outline-primary btn-lg px-5 py-3 fw-semibold" style={{
                                        borderRadius: '50px',
                                        border: '2px solid #1e8449',
                                        color: '#1e8449',
                                        fontWeight: '600',
                                        textDecoration: 'none',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 4px 15px rgba(212, 175, 55, 0.2)'
                                    }}>
                                        <BsBuilding className="me-2" />View Timelines
                                    </button>
                                    <button onClick={() => navigate("/projects")} className="btn btn-primary btn-lg px-5 py-3 fw-semibold" style={{
                                        borderRadius: '50px',
                                        background: 'linear-gradient(135deg, #1e8449 0%, #27ae60 100%)',
                                        border: 'none',
                                        color: '#fff',
                                        fontWeight: '600',
                                        boxShadow: '0 4px 20px rgba(212, 175, 55, 0.4)',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        <BsBuilding className="me-2" />View Projects
                                    </button>
                                    <button onClick={() => navigate("/financial-dashboard")} className="btn btn-outline-primary btn-lg px-5 py-3 fw-semibold" style={{
                                        borderRadius: '50px',
                                        border: '2px solid #1e8449',
                                        color: '#1e8449',
                                        fontWeight: '600',
                                        textDecoration: 'none',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 4px 15px rgba(212, 175, 55, 0.2)'
                                    }}>
                                        <BsBuilding className="me-2" />View Dashboards
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Navigation Tabs and Filters */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="card shadow-sm border-0">
                            <div className="card-body">
                                <div className="row align-items-center">
                                    <div className="col-lg-6">
                                        <ul className="nav nav-pills">
                                            <li className="nav-item">
                                                <button
                                                    className={`nav-link ${viewMode === 'card' ? 'active' : ''}`}
                                                    onClick={() => setViewMode('card')}
                                                >
                                                    <BsGrid className="me-2" />
                                                    Card View
                                                </button>
                                            </li>
                                            <li className="nav-item">
                                                <button
                                                    className={`nav-link ${viewMode === 'table' ? 'active' : ''}`}
                                                    onClick={() => setViewMode('table')}
                                                >
                                                    <BsList className="me-2" />
                                                    Table View
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="col-lg-6">
                                        <div className="row g-2 align-items-center">
                                            <div className="col">
                                                <div className="input-group">
                                                    <span className="input-group-text">
                                                        <BsSearch />
                                                    </span>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Search requests..."
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <style>
                    {`
  .nav-pills .nav-link.active {
    background: linear-gradient(135deg, #1e8449 0%, #27ae60 100%) !important;
    color: #fff !important;
    border-radius: 8px;
  }
  .nav-pills .nav-link {
    color: #1e8449;
  }
  .nav-pills .nav-link:hover {
    color: #27ae60;
  }
`}
                </style>

                {/* Card View */}
                {viewMode === 'card' && (
                    <div>
                        <div className="row g-4">
                            {filteredReqs.length === 0 ? (
                                <div className="col-12">
                                    <div className="text-center py-5">
                                        <BsFileText size={48} className="text-muted mb-3" />
                                        <h4 className="text-muted">No project requests found</h4>
                                        <p className="text-muted">There are no project requests matching your current filters.</p>
                                    </div>
                                </div>
                            ) : (
                                filteredReqs.map((req) => (
                                    <div key={req._id} className="col-lg-4 col-md-6">
                                        <div className="card border-0 shadow card-hover h-100">
                                            <div className="card-body">
                                                <div className="d-flex justify-content-between align-items-start mb-3">
                                                    <div>
                                                        <h5 className="card-title mb-1">{req.preqname}</h5>
                                                        <p className="text-muted small mb-0">
                                                            <BsCalendar className="me-1" />
                                                            {new Date(req.preqdate).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <span className="badge bg-success">New</span>
                                                </div>

                                                <div className="mb-3">
                                                    <div className="d-flex align-items-center mb-2">
                                                        <BsEnvelope className="me-2 text-muted" />
                                                        <small>{req.preqmail}</small>
                                                    </div>
                                                    <div className="d-flex align-items-center mb-2">
                                                        <BsTelephone className="me-2 text-muted" />
                                                        <small>{req.preqnumber}</small>
                                                    </div>
                                                </div>

                                                <div className="mb-3">
                                                    <p className="card-text">
                                                        {req.preqdescription.length > 100
                                                            ? `${req.preqdescription.substring(0, 100)}...`
                                                            : req.preqdescription}
                                                    </p>
                                                </div>

                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div className="btn-group btn-group-sm">
                                                        <button
                                                            className="btn btn-outline-primary"
                                                            onClick={() => openDetailModal(req)}
                                                            title="View Details"
                                                        >
                                                            <BsEye />
                                                        </button>
                                                        <button
                                                            className="btn btn-outline-danger"
                                                            onClick={() => handleDelete(req._id)}
                                                            title="Delete Request"
                                                        >
                                                            <BsTrash />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Table View */}
                {viewMode === 'table' && (
                    <div className="card border-0 shadow">
                        <div className="card-header bg-light border-0">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">Project Requests</h5>
                                <small className="text-muted">
                                    Showing {filteredReqs.length} of {projectReqs.length} requests
                                </small>
                            </div>
                        </div>
                        <div className="card-body p-0">
                            {filteredReqs.length === 0 ? (
                                <div className="text-center py-5">
                                    <BsFileText size={48} className="text-muted mb-3" />
                                    <h4 className="text-muted">No project requests found</h4>
                                    <p className="text-muted">There are no project requests matching your current filters.</p>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead className="table-dark">
                                            <tr>
                                                <th>Client Name</th>
                                                <th>Contact</th>
                                                <th>Date</th>
                                                <th>Description</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredReqs.map((req) => (
                                                <tr key={req._id}>
                                                    <td>
                                                        <div className="fw-semibold">{req.preqname}</div>
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <div className="d-flex align-items-center">
                                                                <BsEnvelope className="me-1 text-muted" />
                                                                <small>{req.preqmail}</small>
                                                            </div>
                                                            <div className="d-flex align-items-center">
                                                                <BsTelephone className="me-1 text-muted" />
                                                                <small>{req.preqnumber}</small>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        {new Date(req.preqdate).toLocaleDateString()}
                                                    </td>
                                                    <td>
                                                        <div style={{ maxWidth: '300px' }}>
                                                            {req.preqdescription.length > 100
                                                                ? `${req.preqdescription.substring(0, 100)}...`
                                                                : req.preqdescription}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="btn-group btn-group-sm">
                                                            <button
                                                                className="btn btn-outline-primary"
                                                                onClick={() => openDetailModal(req)}
                                                                title="View Details"
                                                            >
                                                                <BsEye />
                                                            </button>
                                                            <button
                                                                className="btn btn-outline-danger"
                                                                onClick={() => handleDelete(req._id)}
                                                                title="Delete Request"
                                                            >
                                                                <BsTrash />
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
                )}

                {/* Detail Modal */}
                {showModal && selectedReq && (
                    <div
                        className="modal fade show d-block"
                        style={{
                            backgroundColor: 'rgba(15, 23, 42, 0.75)',
                            backdropFilter: 'blur(8px)',
                            zIndex: 1055
                        }}
                    >
                        <div className="modal-dialog modal-lg modal-dialog-centered">
                            <div
                                className="modal-content border-0 shadow-2xl"
                                style={{
                                    borderRadius: '24px',
                                    background: 'linear-gradient(145deg, #ffffff 0%, #fefefe 100%)',
                                    boxShadow: '0 25px 80px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                                    overflow: 'hidden'
                                }}
                            >
                                <div
                                    className="modal-header border-0 position-relative"
                                    style={{
                                        background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                                        padding: '2rem 2.5rem 1.5rem',
                                        color: '#ffffff'
                                    }}
                                >
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)',
                                            pointerEvents: 'none'
                                        }}
                                    ></div>

                                    <div className="d-flex align-items-center position-relative">
                                        <div
                                            className="me-4 d-flex align-items-center justify-content-center"
                                            style={{
                                                width: '64px',
                                                height: '64px',
                                                borderRadius: '20px',
                                                background: 'linear-gradient(135deg, #047857 0%, #10b981 100%)',
                                                boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4)'
                                            }}
                                        >
                                            <BsFileText className="text-white fs-3" />
                                        </div>
                                        <div className="flex-grow-1">
                                            <h3 className="modal-title fw-bold mb-2 text-white">
                                                Project Request Details
                                            </h3>
                                            <p className="mb-0 text-white-75 fs-5">
                                                Submitted on {new Date(selectedReq.preqdate).toLocaleDateString('en-US', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className="btn-close btn-close-white position-absolute top-0 end-0 me-3 mt-3"
                                        onClick={() => setShowModal(false)}
                                    ></button>
                                </div>

                                <div className="modal-body" style={{ padding: '2.5rem' }}>
                                    <div className="row g-4">
                                        <div className="col-lg-6">
                                            <div className="border-start border-4 border-success ps-3 mb-4">
                                                <small className="text-muted text-uppercase fw-semibold">Client Name</small>
                                                <p className="fw-bold mb-0 mt-1" style={{ color: '#1f2937', fontSize: '1.2rem' }}>
                                                    {selectedReq.preqname}
                                                </p>
                                            </div>

                                            <div className="border-start border-4 border-info ps-3 mb-4">
                                                <small className="text-muted text-uppercase fw-semibold">Email Address</small>
                                                <p className="fw-bold mb-0 mt-1" style={{ color: '#1f2937', fontSize: '1.1rem' }}>
                                                    <BsEnvelope className="me-2" />
                                                    {selectedReq.preqmail}
                                                </p>
                                            </div>

                                            <div className="border-start border-4 border-warning ps-3 mb-4">
                                                <small className="text-muted text-uppercase fw-semibold">Phone Number</small>
                                                <p className="fw-bold mb-0 mt-1" style={{ color: '#1f2937', fontSize: '1.1rem' }}>
                                                    <BsTelephone className="me-2" />
                                                    {selectedReq.preqnumber}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="col-lg-6">
                                            <div
                                                className="card h-100 border-0 shadow-sm"
                                                style={{
                                                    borderRadius: '20px',
                                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                    color: '#ffffff'
                                                }}
                                            >
                                                <div className="card-body p-4">
                                                    <h6 className="fw-bold mb-3 text-white-75">Request Information</h6>
                                                    <div className="d-flex justify-content-between mb-2">
                                                        <span className="text-white-75">Status:</span>
                                                        <span className="fw-semibold">New Request</span>
                                                    </div>
                                                    <div className="d-flex justify-content-between mb-2">
                                                        <span className="text-white-75">Submitted:</span>
                                                        <span className="fw-semibold">
                                                            {new Date(selectedReq.preqdate).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <div className="d-flex justify-content-between">
                                                        <span className="text-white-75">Time:</span>
                                                        <span className="fw-semibold">
                                                            {new Date(selectedReq.preqdate).toLocaleTimeString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-12">
                                            <div
                                                className="card border-0 shadow-sm"
                                                style={{
                                                    borderRadius: '24px',
                                                    background: 'linear-gradient(145deg, #f0fdf4 0%, #dcfce7 100%)',
                                                    border: '1px solid rgba(16, 185, 129, 0.2)'
                                                }}
                                            >
                                                <div className="card-body p-4">
                                                    <h6 className="fw-bold mb-3 d-flex align-items-center" style={{ color: '#065f46' }}>
                                                        <BsFileText className="me-3" />
                                                        Project Description
                                                    </h6>
                                                    <div
                                                        className="p-4 rounded-3"
                                                        style={{
                                                            background: 'rgba(255, 255, 255, 0.7)',
                                                            border: '1px solid rgba(16, 185, 129, 0.1)',
                                                            lineHeight: '1.6'
                                                        }}
                                                    >
                                                        <p className="mb-0" style={{ color: '#064e3b' }}>
                                                            {selectedReq.preqdescription}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div
                                    className="modal-footer border-0 d-flex justify-content-end"
                                    style={{
                                        padding: '1.5rem 2.5rem 2rem',
                                        background: 'linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)'
                                    }}
                                >
                                    <button
                                        type="button"
                                        className="btn btn-light border-0 rounded-pill px-4 py-2 fw-semibold"
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.8)',
                                            backdropFilter: 'blur(10px)',
                                            color: '#6b7280',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onClick={() => setShowModal(false)}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer Info */}
                <div className="row mt-5 mb-4">
                    <div className="col-12">
                        <div className="card bg-light border-0">
                            <div className="card-body text-center py-3">
                                <small className="text-muted">
                                    💡 Switch between card and table views using the tabs above • Use the search bar to find specific requests •
                                    Click the eye icon to view full details • Delete requests when they've been processed
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}