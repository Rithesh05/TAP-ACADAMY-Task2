import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { dashboardService } from '../../services/dashboardService';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, TrendingUp, AlertCircle, CheckCircle, Loader, Phone, Mail } from 'lucide-react';

const ManagerDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [allEmployees, setAllEmployees] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [hoveredLine, setHoveredLine] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getManagerDashboard();
      console.log('Dashboard data:', data);
      setDashboard(data);
      
      // Fetch all employees with today's status
      if (data.allEmployeesWithStatus && data.allEmployeesWithStatus.length > 0) {
        console.log('Setting all employees:', data.allEmployeesWithStatus);
        setAllEmployees(data.allEmployeesWithStatus);
      } else {
        console.log('No allEmployeesWithStatus data received');
      }
    } catch (err) {
      setError('Failed to load dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const todayStats = dashboard?.todayStats || {};
  const weeklyTrend = dashboard?.weeklyTrend || [];
  const departmentStats = dashboard?.departmentStats || {};
  const currentlyWorking = dashboard?.currentlyWorking || [];

  const departmentChartData = Object.entries(departmentStats).map(([dept, stats]) => ({
    name: dept,
    present: stats.present || 0,
    absent: stats.absent || 0,
    late: stats.late || 0,
  }));

  // Filter employees based on status
  const filteredEmployees = statusFilter === 'all' 
    ? allEmployees 
    : allEmployees.filter((emp) => emp.status === statusFilter);

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'absent':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'late':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'half-day':
        return 'bg-orange-50 border-orange-200 text-orange-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      case 'half-day':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };


  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Manager Dashboard</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard icon={<Users />} label="Total Employees" value={dashboard?.totalEmployees || 0} color="blue" />
        <StatCard icon={<CheckCircle />} label="Present Today" value={todayStats.present || 0} color="green" />
        <StatCard icon={<AlertCircle />} label="Absent Today" value={todayStats.absent || 0} color="red" />
        <StatCard icon={<TrendingUp />} label="Late Arrivals" value={todayStats.late || 0} color="yellow" />
        <StatCard label="Not Marked" value={todayStats.notMarked || 0} color="gray" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Weekly Trend */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Weekly Attendance Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart 
              data={weeklyTrend}
              onMouseMove={(state) => {
                if (state && state.isTooltipActive) {
                  setHoveredLine(null);
                }
              }}
              onMouseLeave={() => setHoveredLine(null)}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend 
                onMouseEnter={(e) => setHoveredLine(e.dataKey)}
                onMouseLeave={() => setHoveredLine(null)}
              />
              <Line 
                type="monotone" 
                dataKey="present" 
                stroke="#10b981" 
                strokeWidth={hoveredLine === 'present' || hoveredLine === null ? 2 : 1}
                opacity={hoveredLine === null || hoveredLine === 'present' ? 1 : 0.2}
              />
              <Line 
                type="monotone" 
                dataKey="absent" 
                stroke="#ef4444" 
                strokeWidth={hoveredLine === 'absent' || hoveredLine === null ? 2 : 1}
                opacity={hoveredLine === null || hoveredLine === 'absent' ? 1 : 0.2}
              />
              <Line 
                type="monotone" 
                dataKey="late" 
                stroke="#f59e0b" 
                strokeWidth={hoveredLine === 'late' || hoveredLine === null ? 2 : 1}
                opacity={hoveredLine === null || hoveredLine === 'late' ? 1 : 0.2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Department-wise Attendance */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Department-wise Attendance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="present" fill="#10b981" />
              <Bar dataKey="absent" fill="#ef4444" />
              <Bar dataKey="late" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Today's Summary Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Today's Attendance Summary</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Present', value: todayStats.present || 0 },
                  { name: 'Absent', value: todayStats.absent || 0 },
                  { name: 'Late', value: todayStats.late || 0 },
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                <Cell fill="#10b981" />
                <Cell fill="#ef4444" />
                <Cell fill="#f59e0b" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Currently Working */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Currently Working - {user?.department}</h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {currentlyWorking.filter((emp) => emp.department === user?.department).length > 0 ? (
              currentlyWorking
                .filter((emp) => emp.department === user?.department)
                .map((employee) => (
                  <div key={employee._id} className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{employee.userName}</p>
                        <p className="text-sm text-gray-600">{employee.userEmail}</p>
                        <p className="text-sm text-gray-600">{employee.department}</p>
                        <p className="text-sm text-blue-700 mt-1">
                          Check In: {new Date(employee.checkInTime).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-2">
                        <a
                          href={`tel:${employee.userEmail}`}
                          className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
                          title="Call"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                        <a
                          href={`mailto:${employee.userEmail}`}
                          className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
                          title="Send Email"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-gray-500 text-center py-8">No one from your department currently working</p>
            )}
          </div>
        </div>
      </div>

      {/* All Employees with Today's Status */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">All Employees - Today's Status</h2>
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              statusFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('present')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              statusFilter === 'present'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Present
          </button>
          <button
            onClick={() => setStatusFilter('absent')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              statusFilter === 'absent'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Absent
          </button>
          <button
            onClick={() => setStatusFilter('late')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              statusFilter === 'late'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Late
          </button>
          <button
            onClick={() => setStatusFilter('half-day')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              statusFilter === 'half-day'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Half Day
          </button>
        </div>

        {/* Employees Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Employee Name</th>
                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Department</th>
                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp) => (
                  <tr key={emp._id} className={`border-b ${getStatusColor(emp.status)}`}>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-gray-800">{emp.name}</p>
                      <p className="text-sm text-gray-600">{emp.email}</p>
                    </td>
                    <td className="py-3 px-4">{emp.department}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeColor(emp.status)}`}>
                        {emp.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="py-8 text-center text-gray-500">
                    No employees found with this status
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    gray: 'bg-gray-50 text-gray-600',
  };

  return (
    <div className={`${colorClasses[color]} rounded-lg p-4`}>
      {icon && <div className="flex justify-center mb-2">{React.cloneElement(icon, { className: 'w-6 h-6' })}</div>}
      <p className="text-sm font-medium text-center">{label}</p>
      <p className="text-3xl font-bold text-center">{value}</p>
    </div>
  );
};

export default ManagerDashboard;
