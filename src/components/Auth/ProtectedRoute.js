// src/components/Auth/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    // Rediriger vers la page de connexion si non authentifié
    return <Navigate to="/connexion" replace />;
  }

  return children;
};

export default ProtectedRoute;