import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { NavLink } from 'react-router-dom';

export default function Nav() {
  return (
    <nav className="navbar navbar-dark bg-dark shadow-lg">
      <div className="container">
        <NavLink className="navbar-brand fw-bold" to="/Projects">
          WorkFlows Engineering
        </NavLink>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <NavLink to="/projects" className={({ isActive }) =>
                'nav-link' + (isActive ? ' active' : '')
              }>
                Projects
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/dashboard" className={({ isActive }) =>
                'nav-link' + (isActive ? ' active' : '')
              }>
                Dashboard
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
