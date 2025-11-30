import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader, ArrowLeft, Mail, Phone, Calendar, CheckCircle, AlertCircle, Clock, Minus, Briefcase, Building2 } from 'lucide-react';
import { attendanceService } from '../../services/attendanceService';

const MemberDetails = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const [memberData, setMemberData] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    fetchMemberDetails();
  }, [memberId]);

  const fetchMemberDetails = async () => {
    try {
      setLoading(true);
      const data = await attendanceService.getMemberAttendanceHistory(memberId);
      console.log('Member data:', data);
      setMemberData(data.member);
      setAttendanceHistory(data.history);
    } catch (err) {
      setError('Failed to load member details');
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

  if (!memberData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/manager/my-department')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Department
        </button>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || 'Member not found'}
        </div>
      </div>
    );
  }

  // Calculate statistics
  const stats = {
    total: attendanceHistory.length,
    present: attendanceHistory.filter((a) => a.status === 'present').length,
    absent: attendanceHistory.filter((a) => a.status === 'absent').length,
    late: attendanceHistory.filter((a) => a.status === 'late').length,
    halfDay: attendanceHistory.filter((a) => a.status === 'half-day').length,
  };

  // Filter attendance records
  const filteredRecords = selectedStatus === 'all'
    ? attendanceHistory
    : attendanceHistory.filter((record) => record.status === selectedStatus);

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
      default:
        return <Calendar className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/manager/my-department')}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-semibold"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Department
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Member Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{memberData.name}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-600">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span className="text-sm"><span className="font-semibold">Employee ID:</span> {memberData.employeeId}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span className="text-sm"><span className="font-semibold">Department:</span> {memberData.department}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                <span className="text-sm"><span className="font-semibold">Email:</span> {memberData.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-600" />
                <span className="text-sm"><span className="font-semibold">Phone:</span> {memberData.phoneNumber || 'Not provided'}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <a
              href={`tel:${memberData.phoneNumber}`}
              className="flex items-center justify-center gap-2 p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition disabled:opacity-50"
              title="Call"
              disabled={!memberData.phoneNumber}
            >
              <Phone className="w-5 h-5" />
            </a>
            <a
              href={`mailto:${memberData.email}`}
              className="flex items-center justify-center gap-2 p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
              title="Send Email"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard
          icon={<Calendar />}
          label="Total Days"
          value={stats.total}
          color="blue"
        />
        <StatCard
          icon={<CheckCircle />}
          label="Present"
          value={stats.present}
          color="green"
        />
        <StatCard
          icon={<AlertCircle />}
          label="Absent"
          value={stats.absent}
          color="red"
        />
        <StatCard
          icon={<Clock />}
          label="Late"
          value={stats.late}
          color="yellow"
        />
        <StatCard
          icon={<Minus />}
          label="Half-day"
          value={stats.halfDay}
          color="orange"
        />
      </div>

      {/* Attendance History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Attendance History</h2>

        {/* Status Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <p className="text-sm font-semibold text-gray-700 w-full mb-2">Filter by Status:</p>
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              selectedStatus === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => setSelectedStatus('present')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              selectedStatus === 'present'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Present ({stats.present})
          </button>
          <button
            onClick={() => setSelectedStatus('absent')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              selectedStatus === 'absent'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Absent ({stats.absent})
          </button>
          <button
            onClick={() => setSelectedStatus('late')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              selectedStatus === 'late'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Late ({stats.late})
          </button>
          <button
            onClick={() => setSelectedStatus('half-day')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              selectedStatus === 'half-day'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Half-day ({stats.halfDay})
          </button>
        </div>

        {/* Attendance Records Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Date</th>
                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Status</th>
                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Check In</th>
                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Check Out</th>
                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Total Hours</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <tr key={record._id} className={`border-b ${getStatusColor(record.status)}`}>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(record.status)}
                        <span className="font-semibold text-gray-800">{formatDate(record.date)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeColor(record.status)}`}>
                        {record.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{formatTime(record.checkInTime)}</td>
                    <td className="py-3 px-4 text-gray-700">{formatTime(record.checkOutTime)}</td>
                    <td className="py-3 px-4 text-gray-700 font-semibold">{record.totalHours || '-'} hrs</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">
                    No attendance records found for this status
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
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className={`${colorClasses[color]} rounded-lg p-4`}>
      {icon && <div className="flex justify-center mb-2">{React.cloneElement(icon, { className: 'w-6 h-6' })}</div>}
      <p className="text-sm font-medium text-center">{label}</p>
      <p className="text-3xl font-bold text-center">{value}</p>
    </div>
  );
};

export default MemberDetails;
