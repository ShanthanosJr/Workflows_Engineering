import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import ProjectHome from './Components/Home/ProjectHome';
import ProjectsDisplay from './Components/Projects/ProjectsDisplay';
import AddProjects from './Components/Projects/AddProjects';
import UpdateProjects from './Components/Projects/UpdateProjects';
import Timelines from './Components/Timelines/Timelines';
import AddTimelines from './Components/Timelines/AddTimelines';
import UpdateTimelines from './Components/Timelines/UpdateTimelines';
import ProjectsView from './Components/Projects/ProjectsView';
import TimelinesView from './Components/Timelines/TimelinesView';
import ProjectsFD from './Components/Projects/ProjectsFD';
import ProjectTimeline from './Components/ProjectTimeline/ProjectTimeline';
import AddProjectTimelines from './Components/ProjectTimeline/AddProjectTimelines';
import UpdateProjectTimeline from './Components/ProjectTimeline/UpdateProjectTimeline';
import FinancialDashboard from './Components/FinancialDashboard/FinancialDashboard';
import FinancialDashboardView from './Components/FinancialDashboard/FinancialDashboardView';
import ChatBot from './Components/ChatBot/ChatBot';


export default function App() {
  return (
    <div>
      <Routes>
        {/* Home route */}
        <Route path="/" element={<ProjectHome />} />
        <Route path="/home" element={<ProjectHome />} />
        {/* Add project routes here */}
        <Route path="/projects" element={<ProjectsDisplay />} />
        <Route path="/add-project" element={<AddProjects />} />
        <Route path="projects/:id" element={<UpdateProjects />} />
        <Route path="project-view/:id" element={<ProjectsView />} />
        <Route path="projects-fd" element={<ProjectsFD />} />
        {/* Add timeline routes here */}
        <Route path="/timelines" element={<Timelines />} />
        <Route path="/add-timeline" element={<AddTimelines />} />
        <Route path="/update-timeline/:id" element={<UpdateTimelines />} />
        <Route path="/timeline/:id" element={<TimelinesView />} />
        {/* Add timeline routes here */}
        <Route path="/project-timelines" element={<ProjectTimeline />} />
        <Route path="/add-project-timeline" element={<AddProjectTimelines />} />
        <Route path="/update-project-timeline/:id" element={<UpdateProjectTimeline />} />
        {/* Financial Dashboard routes */}
        <Route path="/financial-dashboard" element={<FinancialDashboard />} />
        <Route path="/financial-dashboard/view/:id" element={<FinancialDashboardView />} />
        {/* ChatBot routes */}
        <Route path="/chatbot" element={<ChatBot />} />
      </Routes>
    </div>
  );
}
