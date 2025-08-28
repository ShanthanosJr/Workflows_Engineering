import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { NavLink } from 'react-router-dom';

export default function Nav() {
  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark shadow-lg" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderBottom: '3px solid rgba(255,255,255,0.1)'
      }}>
        <div className="container">
          <NavLink 
            className="navbar-brand fw-bold d-flex align-items-center" 
            to="/projects"
            style={{ 
              fontSize: '1.5rem',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
            }}
          >
            <span className="me-2">🏗️</span>
            WorkFlows Engineering
          </NavLink>

          <button
            className="navbar-toggler border-0"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.1)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.2)';
              e.target.style.transform = 'rotate(90deg)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.1)';
              e.target.style.transform = 'rotate(0deg)';
            }}
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item mx-2">
                <NavLink 
                  to="/projects" 
                  className={({ isActive }) =>
                    `nav-link px-4 py-2 rounded-pill fw-semibold position-relative overflow-hidden ${
                      isActive ? 'text-white' : 'text-white-50'
                    }`
                  }
                  style={{
                    transition: 'all 0.3s ease',
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                  onMouseEnter={(e) => {
                    if (!e.target.classList.contains('active')) {
                      e.target.style.background = 'rgba(255,255,255,0.2)';
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
                      e.target.classList.remove('text-white-50');
                      e.target.classList.add('text-white');
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.target.classList.contains('active')) {
                      e.target.style.background = 'rgba(255,255,255,0.1)';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                      e.target.classList.remove('text-white');
                      e.target.classList.add('text-white-50');
                    }
                  }}
                >
                  <span className="me-2">📊</span>
                  Projects
                </NavLink>
              </li>
              <li className="nav-item mx-2">
                <NavLink 
                  to="/timelines" 
                  className={({ isActive }) =>
                    `nav-link px-4 py-2 rounded-pill fw-semibold position-relative overflow-hidden ${
                      isActive ? 'text-white' : 'text-white-50'
                    }`
                  }
                  style={{
                    transition: 'all 0.3s ease',
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                  onMouseEnter={(e) => {
                    if (!e.target.classList.contains('active')) {
                      e.target.style.background = 'rgba(255,255,255,0.2)';
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
                      e.target.classList.remove('text-white-50');
                      e.target.classList.add('text-white');
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.target.classList.contains('active')) {
                      e.target.style.background = 'rgba(255,255,255,0.1)';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                      e.target.classList.remove('text-white');
                      e.target.classList.add('text-white-50');
                    }
                  }}
                >
                  <span className="me-2">📅</span>
                  Timelines
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <style jsx global>{`
        /* Custom styles for active nav links */
        .navbar-nav .nav-link.active {
          background: rgba(255,255,255,0.25) !important;
          color: white !important;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3) !important;
          transform: translateY(-2px) !important;
        }

        /* Hover animation for brand */
        .navbar-brand {
          position: relative;
        }

        .navbar-brand::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #fff, transparent);
          transition: width 0.3s ease;
        }

        .navbar-brand:hover::after {
          width: 100%;
        }

        /* Mobile responsive improvements */
        @media (max-width: 991.98px) {
          .navbar-collapse {
            background: rgba(0,0,0,0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 20px;
            margin-top: 15px;
            border: 1px solid rgba(255,255,255,0.1);
          }
          
          .navbar-nav .nav-item {
            margin: 8px 0 !important;
          }

          .navbar-nav .nav-link {
            text-align: center;
            padding: 12px 20px !important;
          }
        }

        /* Glassmorphism effect for navigation */
        .navbar {
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        /* Smooth scroll behavior */
        html {
          scroll-behavior: smooth;
        }

        /* Add subtle animation to the entire navbar */
        .navbar {
          animation: slideDown 0.5s ease-out;
        }

        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        /* Custom focus states for accessibility */
        .navbar-nav .nav-link:focus {
          outline: 2px solid rgba(255,255,255,0.5);
          outline-offset: 2px;
          border-radius: 25px;
        }

        .navbar-brand:focus {
          outline: 2px solid rgba(255,255,255,0.5);
          outline-offset: 2px;
          border-radius: 8px;
        }
      `}</style>
    </>
  );
}