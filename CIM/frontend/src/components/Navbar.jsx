import React from 'react'

export default function Navbar({ page, user, onLogout }){
  const go = (p) => () => {
    const target = `#/${p}`
    if (location.hash !== target) location.hash = target   // hash-ONLY navigation
  }

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom">
      <div className="container-fluid">
        <span className="navbar-brand fw-bold text-primary">
          <i className="fa-solid fa-helmet-safety me-2"></i>CAM Compliance
        </span>
        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
          {['Dashboard','Inspections','Complaints','Analytics'].map(p => (
            <li key={p} className="nav-item">
              <a className={`nav-link ${page===p?'active':''}`} onClick={go(p)}>{p}</a>
            </li>
          ))}
        </ul>
        <div className="d-flex align-items-center">
          <span className="me-3 small text-secondary">
            Welcome {user?.name} ({user?.role})
          </span>
          <button className="btn btn-sm btn-outline-secondary" onClick={onLogout}>
            <i className="fa-solid fa-right-from-bracket me-1"></i>Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
