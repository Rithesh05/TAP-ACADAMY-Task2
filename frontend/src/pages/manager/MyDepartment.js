import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import { Loader, Phone, Mail, Users, CheckCircle, AlertCircle, Clock, Minus, Eye } from 'lucide-react';

const MyDepartment = () => {
  const navigate = useNavigate();
  const [departmentData, setDepartmentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  useEffect(() => {
    fetchDepartmentDetails();
  }, []);

  const fetchDepartmentDetails = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getManagerDepartmentDetails();
      console.log('Department data:', data);
      setDepartmentData(data);
    } catch (err) {
      setError('Failed to load department details');
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
      case 'not-marked':
        return 'bg-gray-50 border-gray-200 text-gray-700';
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
      case 'not-marked':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'absent':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'late':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'half-day':
        return <Minus className="w-5 h-5 text-orange-600" />;
      case 'not-marked':
        return <Users className="w-5 h-5 text-gray-600" />;
      default:
        return <Users className="w-5 h-5 text-gray-600" />;
    }
  };

  // Get unique departments
  const departments = ['all', ...new Set((departmentData?.employees || []).map((emp) => emp.department))];

  // Calculate department-wise stats
  const departmentStats = {};
  (departmentData?.employees || []).forEach((emp) => {
    if (!departmentStats[emp.department]) {
      departmentStats[emp.department] = {
        total: 0,
        present: 0,
        absent: 0,
        late: 0,
        halfDay: 0,
        notMarked: 0,
      };
    }
    departmentStats[emp.department].total += 1;
    if (emp.status === 'present') departmentStats[emp.department].present += 1;
    else if (emp.status === 'absent') departmentStats[emp.department].absent += 1;
    else if (emp.status === 'late') departmentStats[emp.department].late += 1;
    else if (emp.status === 'half-day') departmentStats[emp.department].halfDay += 1;
    else if (emp.status === 'not-marked') departmentStats[emp.department].notMarked += 1;
  });

  // Filter employees by both status and department
  let filteredEmployees = departmentData?.employees || [];
  if (statusFilter !== 'all') {
    filteredEmployees = filteredEmployees.filter((emp) => emp.status === statusFilter);
  }
  if (departmentFilter !== 'all') {
    filteredEmployees = filteredEmployees.filter((emp) => emp.department === departmentFilter);
  }

  const stats = departmentData?.stats || {};

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">My Department</h1>
        <p className="text-lg text-gray-600">{departmentData?.departmentName}</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard
          icon={<Users />}
          label="Total Employees"
          value={departmentData?.totalEmployees || 0}
          color="blue"
        />
        <StatCard
          icon={<CheckCircle />}
          label="Present"
          value={stats.present || 0}
          color="green"
        />
        <StatCard
          icon={<AlertCircle />}
          label="Absent"
          value={stats.absent || 0}
          color="red"
        />
        <StatCard
          icon={<Clock />}
          label="Late"
          value={stats.late || 0}
          color="yellow"
        />
        <StatCard
          label="Not Marked"
          value={stats.notMarked || 0}
          color="gray"
        />
      </div>

      {/* Department-wise Stats */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Department-wise Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(departmentStats).map(([dept, stats]) => (
            <div key={dept} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <h3 className="font-semibold text-gray-800 mb-3">{dept}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-semibold text-gray-800">{stats.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">Present:</span>
                  <span className="font-semibold text-green-700">{stats.present}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-600">Absent:</span>
                  <span className="font-semibold text-red-700">{stats.absent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-600">Late:</span>
                  <span className="font-semibold text-yellow-700">{stats.late}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-orange-600">Half-day:</span>
                  <span className="font-semibold text-orange-700">{stats.halfDay}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Not Marked:</span>
                  <span className="font-semibold text-gray-700">{stats.notMarked}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Department Employees */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Department Members</h2>
        </div>

        {/* Department Filter */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-2">Filter by Department:</p>
          <div className="flex flex-wrap gap-2">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setDepartmentFilter(dept)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  departmentFilter === dept
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {dept === 'all' ? 'All Departments' : dept}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <p className="text-sm font-semibold text-gray-700 w-full mb-2">Filter by Status:</p>
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
          <button
            onClick={() => setStatusFilter('not-marked')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              statusFilter === 'not-marked'
                ? 'bg-gray-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Not Marked
          </button>
        </div>

        {/* Employees Grid/List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map((emp) => (
              <div
                key={emp._id}
                className={`border-l-4 p-4 rounded-lg ${getStatusColor(emp.status)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 text-lg">{emp.name}</h3>
                    <p className="text-sm text-gray-600">{emp.employeeId}</p>
                    <p className="text-xs text-gray-500 mt-1">{emp.department}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {getStatusIcon(emp.status)}
                  </div>
                </div>

                <div className="mb-3">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeColor(emp.status)}`}>
                    {emp.status === 'not-marked' ? 'Not Marked' : emp.status.toUpperCase()}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-3 break-all">{emp.email}</p>

                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/manager/member/${emp._id}`)}
                    className="flex-1 flex items-center justify-center gap-2 p-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition text-sm font-medium"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Details</span>
                  </button>
                  <a
                    href={`tel:${emp.email}`}
                    className="flex-1 flex items-center justify-center gap-2 p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition text-sm font-medium"
                    title="Call"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call</span>
                  </a>
                  <a
                    href={`mailto:${emp.email}`}
                    className="flex-1 flex items-center justify-center gap-2 p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition text-sm font-medium"
                    title="Send Email"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No employees found with this status</p>
            </div>
          )}
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

export default MyDepartment;
