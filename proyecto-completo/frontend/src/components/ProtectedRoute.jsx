import React from 'react';
import { Navigate } from 'react-router-dom';
import { getToken, isTokenValid, removeToken } from '../utils/auth';

function ProtectedRoute({ children }) {
  const token = getToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!isTokenValid(token)) {
    removeToken();
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
