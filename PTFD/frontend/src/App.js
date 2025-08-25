import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import ProjectsDisplay from './Components/Projects/ProjectsDisplay';

export default function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Navigate to="/projects" replace />} />
        <Route path="/projects" element={<ProjectsDisplay />} />
        {/* Add other routes here */}
      </Routes>

      <footer className="App-footer">
        <p>&copy; 2025 Project Tracker</p>
      </footer>
    </div>
  );
}
