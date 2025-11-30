import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { User, Mail, Building2, Briefcase, Calendar, Phone, Edit2, Save, X } from 'lucide-react';
import { authService } from '../../services/authService';
import { setUser } from '../../store/authSlice';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phoneNumber: user?.phoneNumber || '',
  });

  if (!user) {
    return <div>Loading...</div>;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await authService.updateProfile(formData);
      dispatch(setUser(response.user));
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name,
      phoneNumber: user.phoneNumber || '',
    });
    setIsEditing(false);
    setError('');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-32"></div>

        {/* Profile Content */}
        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="flex justify-center -mt-16 mb-6">
            <div className="w-32 h-32 bg-blue-500 rounded-full flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Profile Info */}
          <div className="space-y-6">
            {isEditing ? (
              // Edit Mode
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
                  <p className="text-gray-600 mt-1">{user.role.toUpperCase()}</p>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoCard icon={<Mail />} label="Email" value={user.email} />
                  <InfoCard icon={<Phone />} label="Phone Number" value={user.phoneNumber || 'Not provided'} />
                  <InfoCard icon={<Briefcase />} label="Employee ID" value={user.employeeId} />
                  <InfoCard icon={<Building2 />} label="Department" value={user.department} />
                  <InfoCard icon={<User />} label="Role" value={user.role.charAt(0).toUpperCase() + user.role.slice(1)} />
                  <InfoCard icon={<Calendar />} label="Member Since" value={new Date(user.createdAt).toLocaleDateString()} />
                  <InfoCard
                    icon={<User />}
                    label="Status"
                    value={user.isActive ? 'Active' : 'Inactive'}
                    valueColor={user.isActive ? 'text-green-600' : 'text-red-600'}
                  />
                </div>

                {/* Additional Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">Account Information</h3>
                  <ul className="space-y-2 text-blue-800">
                    <li className="flex items-start space-x-2">
                      <span className="font-bold">•</span>
                      <span>Your account is active and you can mark attendance</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="font-bold">•</span>
                      <span>You can view your attendance history and monthly summary</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="font-bold">•</span>
                      <span>Contact your manager for any attendance-related issues</span>
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoCard = ({ icon, label, value, valueColor = 'text-gray-800' }) => (
  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
    <div className="flex items-center space-x-3 mb-2">
      {React.cloneElement(icon, { className: 'w-5 h-5 text-blue-600' })}
      <p className="text-sm font-medium text-gray-600">{label}</p>
    </div>
    <p className={`text-lg font-semibold ${valueColor}`}>{value}</p>
  </div>
);

export default Profile;
