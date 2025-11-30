import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children, role }) => {
  const { user, token } = useSelector((state) => state.auth);

  console.log('ProtectedRoute check:', { token, user, role });

  if (!token) {
    console.log('No token, redirecting to login');
    return <Navigate to="/login" />;
  }

  if (role && user?.role !== role) {
    console.log('Role mismatch:', { expectedRole: role, userRole: user?.role });
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
