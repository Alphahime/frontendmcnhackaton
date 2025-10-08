// src/components/Auth/AdminRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    // Rediriger vers la page de connexion si non authentifié
    return <Navigate to="/connexion" replace />;
  }

  if (user.role !== 'admin') {
    // Rediriger vers la page d'accueil si pas admin
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;