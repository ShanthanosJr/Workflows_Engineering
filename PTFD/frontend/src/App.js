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
        <Route path="/" element={<Navigate to="/projects" replace />} />
        <Route path="/projects" element={<ProjectsDisplay />} />
        <Route path="/add-project" element={<AddProjects />} />
        <Route path="projects/:id" element={<UpdateProjects />} />
        {/* Add other routes here */}
        <Route path="/timelines" element={<Timelines />} />
        <Route path="/add-timeline" element={<AddTimelines />} />
        <Route path="/update-timeline/:id" element={<UpdateTimelines />} />

      </Routes>

      <footer className="App-footer">
        <p>&copy; 2025 Project Tracker</p>
      </footer>
    </div>
  );
}
