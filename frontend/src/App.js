import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Employee Pages
import EmployeeDashboard from './pages/employee/Dashboard';
import MarkAttendance from './pages/employee/MarkAttendance';
import AttendanceHistory from './pages/employee/AttendanceHistory';
import Profile from './pages/employee/Profile';

// Manager Pages
import ManagerDashboard from './pages/manager/Dashboard';
import AllEmployeesAttendance from './pages/manager/AllEmployeesAttendance';
import TeamCalendarView from './pages/manager/TeamCalendarView';
import ReportsPage from './pages/manager/ReportsPage';
import ManagerProfile from './pages/manager/Profile';
import MyDepartment from './pages/manager/MyDepartment';
import MemberDetails from './pages/manager/MemberDetails';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

function App() {
  const { token, user } = useSelector((state) => state.auth);

  console.log('App component - Auth state:', { token, user });

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {token && <Navbar />}
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Employee Routes */}
          <Route
            path="/employee/dashboard"
            element={
              <ProtectedRoute role="employee">
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/mark-attendance"
            element={
              <ProtectedRoute role="employee">
                <MarkAttendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/history"
            element={
              <ProtectedRoute role="employee">
                <AttendanceHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/profile"
            element={
              <ProtectedRoute role="employee">
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Manager Routes */}
          <Route
            path="/manager/dashboard"
            element={
              <ProtectedRoute role="manager">
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/my-department"
            element={
              <ProtectedRoute role="manager">
                <MyDepartment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/member/:memberId"
            element={
              <ProtectedRoute role="manager">
                <MemberDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/all-attendance"
            element={
              <ProtectedRoute role="manager">
                <AllEmployeesAttendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/calendar"
            element={
              <ProtectedRoute role="manager">
                <TeamCalendarView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/reports"
            element={
              <ProtectedRoute role="manager">
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/profile"
            element={
              <ProtectedRoute role="manager">
                <ManagerProfile />
              </ProtectedRoute>
            }
          />

          {/* Redirect */}
          <Route path="/" element={<Navigate to={token ? '/employee/dashboard' : '/login'} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
