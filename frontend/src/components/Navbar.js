import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Menu, X, LogOut, Home, Calendar, FileText, User, Building2 } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // Don't render navbar if no user is logged in
  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isManager = user?.role === 'manager';

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 font-bold text-xl">
            <Calendar className="w-6 h-6" />
            <span>Attendance System</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {isManager ? (
              <>
                <NavLink to="/manager/dashboard" icon={<Home className="w-4 h-4" />} label="Dashboard" />
                <NavLink to="/manager/my-department" icon={<Building2 className="w-4 h-4" />} label="My Department" />
                <NavLink to="/manager/all-attendance" icon={<Calendar className="w-4 h-4" />} label="Attendance" />
                <NavLink to="/manager/calendar" icon={<Calendar className="w-4 h-4" />} label="Calendar" />
                <NavLink to="/manager/reports" icon={<FileText className="w-4 h-4" />} label="Reports" />
                <NavLink to="/manager/profile" icon={<User className="w-4 h-4" />} label="Profile" />
              </>
            ) : (
              <>
                <NavLink to="/employee/dashboard" icon={<Home className="w-4 h-4" />} label="Dashboard" />
                <NavLink to="/employee/mark-attendance" icon={<Calendar className="w-4 h-4" />} label="Mark Attendance" />
                <NavLink to="/employee/history" icon={<Calendar className="w-4 h-4" />} label="History" />
                <NavLink to="/employee/profile" icon={<User className="w-4 h-4" />} label="Profile" />
              </>
            )}
          </div>

          {/* User Info and Logout */}
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-sm">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 bg-red-500 hover:bg-red-600 px-3 py-2 rounded-md text-sm font-medium transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {isManager ? (
              <>
                <MobileNavLink to="/manager/dashboard" label="Dashboard" />
                <MobileNavLink to="/manager/my-department" label="My Department" />
                <MobileNavLink to="/manager/all-attendance" label="Attendance" />
                <MobileNavLink to="/manager/calendar" label="Calendar" />
                <MobileNavLink to="/manager/reports" label="Reports" />
                <MobileNavLink to="/manager/profile" label="Profile" />
              </>
            ) : (
              <>
                <MobileNavLink to="/employee/dashboard" label="Dashboard" />
                <MobileNavLink to="/employee/mark-attendance" label="Mark Attendance" />
                <MobileNavLink to="/employee/history" label="History" />
                <MobileNavLink to="/employee/profile" label="Profile" />
              </>
            )}
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 rounded-md text-sm font-medium bg-red-500 hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

const NavLink = ({ to, icon, label }) => (
  <Link
    to={to}
    className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition"
  >
    {icon}
    <span>{label}</span>
  </Link>
);

const MobileNavLink = ({ to, label }) => (
  <Link to={to} className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition">
    {label}
  </Link>
);

export default Navbar;
