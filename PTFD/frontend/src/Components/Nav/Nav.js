import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { NavLink } from 'react-router-dom';

export default function Nav() {
  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light shadow-lg" style={{
        background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 25%, #6c5ce7 50%, #fd79a8 75%, #fdcb6e 100%)',
        borderBottom: '3px solid rgba(255,255,255,0.3)'
      }}>
        <div className="container">
          <NavLink 
            className="navbar-brand fw-bold d-flex align-items-center" 
            to="/projects"
            style={{ 
              fontSize: '1.5rem',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              transition: 'all 0.3s ease',
              color: 'white',
              fontWeight: '700'
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
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.25)',
              transition: 'all 0.3s ease',
              border: '2px solid rgba(255,255,255,0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.4)';
              e.target.style.transform = 'rotate(90deg) scale(1.1)';
              e.target.style.borderColor = 'rgba(255,255,255,0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.25)';
              e.target.style.transform = 'rotate(0deg) scale(1)';
              e.target.style.borderColor = 'rgba(255,255,255,0.3)';
            }}
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item mx-2">
                <NavLink 
                  to="/projects" 
                  end
                  className={({ isActive }) =>
                    `nav-link px-4 py-2 rounded-pill fw-semibold position-relative overflow-hidden ${
                      isActive ? 'active' : ''
                    }`
                  }
                >
                  <span className="me-2">📊</span>
                  Projects
                </NavLink>
              </li>
              <li className="nav-item mx-2">
                <NavLink 
                  to="/project-timelines" 
                  end
                  className={({ isActive }) =>
                    `nav-link px-4 py-2 rounded-pill fw-semibold position-relative overflow-hidden ${
                      isActive ? 'active project-timeline-nav' : 'project-timeline-nav'
                    }`
                  }
                >
                  <span className="me-2">📈</span>
                  Project Timeline
                  <span className="badge bg-success ms-2" style={{fontSize: '0.7rem', padding: '2px 6px'}}>Pro</span>
                </NavLink>
              </li>
              <li className="nav-item mx-2">
                <NavLink 
                  to="/financial-dashboard" 
                  end
                  className={({ isActive }) =>
                    `nav-link px-4 py-2 rounded-pill fw-semibold position-relative overflow-hidden ${
                      isActive ? 'active financial-dashboard-nav' : 'financial-dashboard-nav'
                    }`
                  }
                >
                  <span className="me-2">💰</span>
                  Financial Dashboard
                  <span className="badge bg-warning text-dark ms-2" style={{fontSize: '0.7rem', padding: '2px 6px'}}>Premium</span>
                </NavLink>
              </li>
              <li className="nav-item mx-2">
                <NavLink 
                  to="/chatbot" 
                  end
                  className={({ isActive }) =>
                    `nav-link px-4 py-2 rounded-pill fw-semibold position-relative overflow-hidden ${
                      isActive ? 'active chatbot-nav' : 'chatbot-nav'
                    }`
                  }
                >
                  <span className="me-2">🤖</span>
                  AI Assistant
                  <span className="badge bg-info ms-2" style={{fontSize: '0.7rem', padding: '2px 6px'}}>AI</span>
                </NavLink>
              </li>
              <li className="nav-item mx-2">
                <NavLink 
                  to="/timelines" 
                  end
                  className={({ isActive }) =>
                    `nav-link px-4 py-2 rounded-pill fw-semibold position-relative overflow-hidden ${
                      isActive ? 'active' : ''
                    }`
                  }
                >
                  <span className="me-2">📅</span>
                  Basic Timeline
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <style jsx global>{`
        .navbar-nav .nav-link {
          transition: all 0.3s ease;
          background: rgba(255,255,255,0.2);
          backdropFilter: blur(10px);
          border: 2px solid rgba(255,255,255,0.3);
          color: white;
          font-weight: 600;
          text-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }

        .navbar-nav .nav-link:hover:not(.active) {
          background: rgba(255,255,255,0.35);
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.2);
          color: white;
          border-color: rgba(255,255,255,0.5);
        }

        .navbar-nav .nav-link.active {
          background: rgba(255,255,255,0.4) !important;
          color: white !important;
          box-shadow: 0 8px 25px rgba(0,0,0,0.3) !important;
          transform: translateY(-3px) !important;
          border-color: rgba(255,255,255,0.6) !important;
        }

        /* Special styling for Project Timeline nav item */
        .project-timeline-nav {
          background: linear-gradient(45deg, rgba(255,255,255,0.3), rgba(46, 213, 115, 0.4)) !important;
          border: 2px solid rgba(46, 213, 115, 0.6) !important;
          box-shadow: 0 4px 15px rgba(46, 213, 115, 0.3) !important;
          color: white !important;
        }

        .project-timeline-nav:hover {
          background: linear-gradient(45deg, rgba(255,255,255,0.4), rgba(46, 213, 115, 0.5)) !important;
          transform: translateY(-4px) !important;
          box-shadow: 0 8px 25px rgba(46, 213, 115, 0.4) !important;
          border-color: rgba(46, 213, 115, 0.8) !important;
        }

        .project-timeline-nav.active {
          background: linear-gradient(45deg, rgba(255,255,255,0.5), rgba(46, 213, 115, 0.6)) !important;
          transform: translateY(-4px) !important;
          box-shadow: 0 10px 30px rgba(46, 213, 115, 0.5) !important;
          border-color: rgba(46, 213, 115, 1) !important;
        }

        /* Special styling for Financial Dashboard nav item */
        .financial-dashboard-nav {
          background: linear-gradient(45deg, rgba(255,255,255,0.3), rgba(255, 193, 7, 0.4)) !important;
          border: 2px solid rgba(255, 193, 7, 0.6) !important;
          box-shadow: 0 4px 15px rgba(255, 193, 7, 0.3) !important;
          color: white !important;
          position: relative;
          overflow: hidden;
        }

        .financial-dashboard-nav::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.5s ease;
        }

        .financial-dashboard-nav:hover::before {
          left: 100%;
        }

        .financial-dashboard-nav:hover {
          background: linear-gradient(45deg, rgba(255,255,255,0.4), rgba(255, 193, 7, 0.5)) !important;
          transform: translateY(-4px) !important;
          box-shadow: 0 8px 25px rgba(255, 193, 7, 0.4) !important;
          border-color: rgba(255, 193, 7, 0.8) !important;
        }

        .financial-dashboard-nav.active {
          background: linear-gradient(45deg, rgba(255,255,255,0.5), rgba(255, 193, 7, 0.6)) !important;
          transform: translateY(-4px) !important;
          box-shadow: 0 10px 30px rgba(255, 193, 7, 0.5) !important;
          border-color: rgba(255, 193, 7, 1) !important;
        }

        /* Special styling for ChatBot AI Assistant nav item */
        .chatbot-nav {
          background: linear-gradient(45deg, rgba(255,255,255,0.3), rgba(138, 43, 226, 0.4)) !important;
          border: 2px solid rgba(138, 43, 226, 0.6) !important;
          box-shadow: 0 4px 15px rgba(138, 43, 226, 0.3) !important;
          color: white !important;
          position: relative;
          overflow: hidden;
        }

        .chatbot-nav::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.5s ease;
        }

        .chatbot-nav:hover::before {
          left: 100%;
        }

        .chatbot-nav:hover {
          background: linear-gradient(45deg, rgba(255,255,255,0.4), rgba(138, 43, 226, 0.5)) !important;
          transform: translateY(-4px) !important;
          box-shadow: 0 8px 25px rgba(138, 43, 226, 0.4) !important;
          border-color: rgba(138, 43, 226, 0.8) !important;
        }

        .chatbot-nav.active {
          background: linear-gradient(45deg, rgba(255,255,255,0.5), rgba(138, 43, 226, 0.6)) !important;
          transform: translateY(-4px) !important;
          box-shadow: 0 10px 30px rgba(138, 43, 226, 0.5) !important;
          border-color: rgba(138, 43, 226, 1) !important;
        }

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

        @media (max-width: 991.98px) {
          .navbar-collapse {
            background: rgba(255,255,255,0.15);
            backdrop-filter: blur(15px);
            border-radius: 20px;
            padding: 25px;
            margin-top: 20px;
            border: 2px solid rgba(255,255,255,0.2);
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
          }
          
          .navbar-nav .nav-item {
            margin: 10px 0 !important;
          }

          .navbar-nav .nav-link {
            text-align: center;
            padding: 15px 25px !important;
            border-radius: 15px !important;
          }
        }

        .navbar {
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        html {
          scroll-behavior: smooth;
        }

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

        .navbar-nav .nav-link:focus {
          outline: 3px solid rgba(255,255,255,0.7);
          outline-offset: 3px;
          border-radius: 25px;
        }

        .navbar-brand:focus {
          outline: 3px solid rgba(255,255,255,0.7);
          outline-offset: 3px;
          border-radius: 12px;
        }
      `}</style>
    </>
  );
}