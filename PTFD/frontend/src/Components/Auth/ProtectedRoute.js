import React from 'react';
import { Navigate } from 'react-router-dom';

// Simple authentication check (in a real app, this would check for a valid token)
const isAuthenticated = () => {
  // For demo purposes, we'll check if there's a user in localStorage
  // In a real application, you would check for a valid JWT token or session
  return localStorage.getItem('user') !== null;
};

const ProtectedRoute = ({ children }) => {
  // If user is not authenticated, redirect to sign in page
  if (!isAuthenticated()) {
    return <Navigate to="/signin" replace />;
  }

  // If user is authenticated, render the protected component
  return children;
};

export default ProtectedRoute;