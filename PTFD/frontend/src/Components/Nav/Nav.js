import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { NavLink, useLocation } from 'react-router-dom';
import UserProfile from '../UserProfile/UserProfile'; // Added import

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [expandPD, setExpandPD] = useState(false); // collapsed by default
  const location = useLocation();

  const closeMenu = () => setOpen(false);
  const toggleMenu = () => setOpen((v) => !v);

  // Helper to compute active class for hash-based items
  const activeLink = (path, hash = '') => {
    const currentHash = location.hash || '';
    return location.pathname === path && currentHash === hash ? 'active' : '';
  };

  return (
    <>
      {/* Top-left hamburger button */}
      <button
        type="button"
        className={`hamburger-btn ${open ? 'open' : ''}`}
        aria-label="Open navigation menu"
        aria-expanded={open}
        aria-controls="side-nav"
        onClick={toggleMenu}
      >
        <span className="bar" />
        <span className="bar" />
        <span className="bar" />
      </button>

      {/* Screen overlay when drawer is open */}
      <div
        className={`overlay ${open ? 'show' : ''}`}
        onClick={closeMenu}
        role="button"
        aria-label="Close navigation overlay"
      />

      {/* Left slide-out drawer */}
      <aside id="side-nav" className={`side-nav ${open ? 'open' : ''}`} aria-hidden={!open}>
        <div className="side-nav-header d-flex align-items-center justify-content-between">
          <div className="brand d-flex align-items-center gap-2 text-warning fw-bold">
            <span className="logo" aria-hidden="true">🏗️</span>
            <span>WORKFLOWS <span className="text-white">ENGINEERING</span></span>
          </div>
          <button className="btn btn-sm btn-outline-warning close-btn" onClick={closeMenu} aria-label="Close menu">✕</button>
        </div>

        <div className="caution-divider" aria-hidden="true">
          <div className="stripe" /><div className="stripe dark" /><div className="stripe" />
        </div>

        <nav className="menu" aria-label="Primary">
          <ul className="list-unstyled m-0 p-0">
            <li className="menu-item">
              <NavLink
                to="/construction"
                className={`link ${activeLink('/construction', '')}`}
                onClick={closeMenu}
              >
                <span className="icon" aria-hidden>🏠</span>
                Home
              </NavLink>
            </li>

            <li className="menu-item">
              <NavLink
                to="/profile"
                className={({ isActive }) => `link ${isActive ? 'active' : ''}`}
                onClick={closeMenu}
              >
                <span className="icon" aria-hidden>👤</span>
                Profile
              </NavLink>
            </li>

            <li className="menu-item">
              <NavLink
                to="/construction#safety"
                className={`link ${activeLink('/construction', '#safety')}`}
                onClick={closeMenu}
              >
                <span className="icon" aria-hidden>🦺</span>
                Workers & Safety
              </NavLink>
            </li>

            <li className="menu-item">
              {/* Map Tools to the Types section (closest available) */}
              <NavLink
                to="/construction#types"
                className={`link ${activeLink('/construction', '#types')}`}
                onClick={closeMenu}
              >
                <span className="icon" aria-hidden>🧰</span>
                Tools
              </NavLink>
            </li>

            <li className="menu-item">
              {/* Map Materials to Project showcase section (placeholder) */}
              <NavLink
                to="/construction#project"
                className={`link ${activeLink('/construction', '#project')}`}
                onClick={closeMenu}
              >
                <span className="icon" aria-hidden>🧱</span>
                Materials
              </NavLink>
            </li>

            <li className="menu-item">
              {/* Map Inspections to Timeline section */}
              <NavLink
                to="/construction#timeline"
                className={`link ${activeLink('/construction', '#timeline')}`}
                onClick={closeMenu}
              >
                <span className="icon" aria-hidden>🔍</span>
                Inspections
              </NavLink>
            </li>

            {/* Projects & Dashboard (accordion) */}
            <li className="menu-item group">
              <button
                className="group-toggle"
                aria-expanded={expandPD}
                aria-controls="group-pd"
                onClick={() => setExpandPD((v) => !v)}
              >
                <span className="icon" aria-hidden>📊</span>
                Projects & Dashboard
                <span className={`chev ${expandPD ? 'open' : ''}`} aria-hidden>▸</span>
              </button>
              <ul id="group-pd" className={`sub-list ${expandPD ? 'open' : ''}`}>
                <li>
                  <NavLink to="/construction" className={({ isActive }) => `sublink ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                    Projects
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/projects" className={({ isActive }) => `sublink ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                    Projects Dashboard
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/project-timelines" className={({ isActive }) => `sublink ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                    Timeline Dashboard
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/financial-dashboard" className={({ isActive }) => `sublink ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                    Financial Dashboard
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/chatbot" className={({ isActive }) => `sublink ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                    ChatBot
                  </NavLink>
                </li>
              </ul>
            </li>
          </ul>
        </nav>

        {/* Profile section at the bottom of the sidebar */}
        <div className="profile-section">
          <div className="welcome-message">
            Welcome to Workflows Engineering
          </div>
          <UserProfile inSidebar={true} />
        </div>
      </aside>

      {/* Styles aligned with ConstructionHome theme (dark + caution yellow) */}
      <style jsx global>{`
        :root {
          --nav-bg: #0e0f12;
          --nav-bg-2: #15171c;
          --nav-border: rgba(255, 193, 7, 0.35);
          --nav-accent: #ffc107; /* Bootstrap warning/caution */
          --nav-text: #ffffff;
          --nav-muted: #cfd3da;
        }

        html { scroll-behavior: smooth; }

        .hamburger-btn {
          position: fixed; top: 16px; left: 16px; z-index: 1100;
          width: 44px; height: 44px; border-radius: 10px;
          border: 2px solid var(--nav-border);
          background: linear-gradient(180deg, var(--nav-bg), var(--nav-bg-2));
          display: grid; place-items: center;
          box-shadow: 0 6px 20px rgba(0,0,0,0.35);
          transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
          color: var(--nav-text);
        }
        .hamburger-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(0,0,0,0.45); border-color: var(--nav-accent); }
        .hamburger-btn .bar {
          display: block; width: 22px; height: 2px; margin: 3px 0;
          background: var(--nav-text); border-radius: 2px;
          transition: transform .2s ease, opacity .2s ease;
        }
        .hamburger-btn.open .bar:nth-child(1) { transform: translateY(5px) rotate(45deg); }
        .hamburger-btn.open .bar:nth-child(2) { opacity: 0; }
        .hamburger-btn.open .bar:nth-child(3) { transform: translateY(-5px) rotate(-45deg); }

        .overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(2px);
          opacity: 0; visibility: hidden; transition: opacity .2s ease, visibility .2s ease; z-index: 1040;
        }
        .overlay.show { opacity: 1; visibility: visible; }

        .side-nav {
          position: fixed; top: 0; left: 0; height: 100vh; width: 320px;
          background: linear-gradient(180deg, var(--nav-bg), var(--nav-bg-2));
          color: var(--nav-text);
          transform: translateX(-100%);
          transition: transform .25s ease; z-index: 1250;
          border-right: 2px solid var(--nav-border);
          box-shadow: 0 16px 48px rgba(0,0,0,0.5);
          display: flex;
          flex-direction: column;
        }
        .side-nav.open { transform: translateX(0); }

        .side-nav-header { padding: 18px 16px; }
        .side-nav .brand .logo { font-size: 1.2rem; }

        .caution-divider { display:flex; height: 8px; }
        .caution-divider .stripe { flex:1; background: repeating-linear-gradient(45deg, var(--nav-accent) 0 12px, #000 12px 24px); }
        .caution-divider .stripe.dark { background: #000; max-width: 12px; }

        .menu { padding: 8px 10px 18px 10px; flex: 1 1 auto; overflow-y: auto; }
        .menu .menu-item { margin: 6px 0; }

        .link, .group-toggle {
          width: 100%; display: flex; align-items: center; gap: 10px;
          padding: 12px 14px; color: var(--nav-text); text-decoration: none;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px; transition: background .2s ease, transform .2s ease, border-color .2s ease;
        }
        .link:hover, .group-toggle:hover { background: rgba(255,255,255,0.08); transform: translateX(2px); border-color: var(--nav-border); }
        .link.active { background: rgba(255, 193, 7, 0.15); border-color: var(--nav-accent); color: #fff; }

        .group { margin-top: 10px; }
        .group-toggle { cursor: pointer; justify-content: space-between; font-weight: 600; }
        .group-toggle .icon { margin-right: auto; }
        .chev { transform: rotate(0deg); transition: transform .2s ease; }
        .chev.open { transform: rotate(90deg); }

        .sub-list { list-style: none; padding-left: 8px; margin: 8px 0 0 26px; border-left: 2px dashed var(--nav-border); max-height: 0; overflow: hidden; transition: max-height .25s ease; }
        .sub-list.open { max-height: 400px; }
        .sublink { display:block; padding: 8px 12px; margin: 6px 0; color: var(--nav-muted); text-decoration:none; border-radius: 8px; transition: background .2s ease, color .2s ease; }
        .sublink:hover { background: rgba(255,255,255,0.06); color: var(--nav-text); }
        .sublink.active { color: #fff; background: rgba(255, 193, 7, 0.12); }

        /* Profile section styles */
        .profile-section {
          padding: 12px 8px;
          border-top: 2px solid var(--nav-border);
          background: rgba(255, 193, 7, 0.05);
          margin-top: auto;
          flex-shrink: 0;
          flex: 0 0 auto;
        }

        .welcome-message {
          color: var(--nav-accent);
          text-align: center;
          padding: 8px 0;
          font-weight: 700;
          font-size: 1rem;
          margin-bottom: 8px;
          border-bottom: 1px dashed var(--nav-border);
        }

        /* Adjust UserProfile styles for sidebar */
        .profile-section .user-profile-container {
          width: 100%;
        }

        .profile-section .user-profile-button {
          width: 100%;
          justify-content: center;
          padding: 12px;
          font-size: 1.1rem;
        }

        @media (max-width: 420px) { .side-nav { width: 88vw; } }
      `}</style>
    </>
  );
}