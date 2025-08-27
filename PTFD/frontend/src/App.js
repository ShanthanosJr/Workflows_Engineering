import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import ProjectsDisplay from './Components/Projects/ProjectsDisplay';
import AddProjects from './Components/Projects/AddProjects';
import UpdateProjects from './Components/Projects/UpdateProjects';
import Timelines from './Components/Timelines/Timelines';
import AddTimelines from './Components/Timelines/AddTimelines';
import UpdateTimelines from './Components/Timelines/UpdateTimelines';


export default function App() {
  return (
    <div>
      <Routes>
        {/* Add project routes here */}
        <Route path="/" element={<Navigate to="/projects" replace />} />
        <Route path="/projects" element={<ProjectsDisplay />} />
        <Route path="/add-project" element={<AddProjects />} />
        <Route path="projects/:id" element={<UpdateProjects />} />
        {/* Add timeline routes here */}
        <Route path="/timelines" element={<Timelines />} />
        <Route path="/add-timeline" element={<AddTimelines />} />
        <Route path="/update-timeline/:id" element={<UpdateTimelines />} />

      </Routes>

      <footer className="App-footer bg-dark text-light py-3 mt-5 border-top shadow-sm">
        <div className="container text-center">
          <p className="mb-1 fw-semibold" style={{ letterSpacing: "1px", fontSize: "1.1rem" }}>
            &copy; 2025 <span className="text-info">Project Tracker</span>
          </p>
          <small className="text-secondary">Empowering Modern Construction Management</small>
        </div>
      </footer>
    </div>
  );
}
