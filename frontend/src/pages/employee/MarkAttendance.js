import React, { useState, useEffect } from 'react';
import { attendanceService } from '../../services/attendanceService';
import { formatTime, formatDate } from '../../utils/dateUtils';
import { CheckCircle, Clock, AlertCircle, Loader } from 'lucide-react';

const MarkAttendance = () => {
  const [todayStatus, setTodayStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTodayStatus();
  }, []);

  const fetchTodayStatus = async () => {
    try {
      setLoading(true);
      const data = await attendanceService.getTodayStatus();
      setTodayStatus(data);
    } catch (err) {
      setError('Failed to load today\'s status');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      setCheckingIn(true);
      setError('');
      const response = await attendanceService.checkIn();
      setTodayStatus(response.attendance);
      setMessage('✓ Checked in successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Check-in failed');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setCheckingOut(true);
      setError('');
      const response = await attendanceService.checkOut();
      setTodayStatus(response.attendance);
      setMessage('✓ Checked out successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Check-out failed');
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const now = new Date();
  const currentTime = formatTime(now);
  const currentDate = formatDate(now);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Mark Attendance</h1>

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center space-x-2">
          <CheckCircle className="w-5 h-5" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Current Time Display */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-8 mb-8">
        <div className="text-center">
          <p className="text-lg opacity-90 mb-2">Current Time</p>
          <p className="text-5xl font-bold mb-2">{currentTime}</p>
          <p className="text-lg opacity-90">{currentDate}</p>
        </div>
      </div>

      {/* Attendance Status Card */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Today's Attendance</h2>

        {todayStatus?.checkInTime ? (
          <div className="space-y-6">
            {/* Check In Info */}
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <div className="flex items-center space-x-3 mb-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold text-green-800">Checked In</h3>
              </div>
              <p className="text-gray-700">
                <strong>Time:</strong> {formatTime(todayStatus.checkInTime)}
              </p>
            </div>

            {/* Check Out Info */}
            {todayStatus.checkOutTime ? (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <div className="flex items-center space-x-3 mb-2">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-blue-800">Checked Out</h3>
                </div>
                <p className="text-gray-700">
                  <strong>Time:</strong> {formatTime(todayStatus.checkOutTime)}
                </p>
                <p className="text-gray-700 mt-2">
                  <strong>Total Hours:</strong> {todayStatus.totalHours?.toFixed(2)} hours
                </p>
              </div>
            ) : (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                <div className="flex items-center space-x-3 mb-2">
                  <Clock className="w-6 h-6 text-yellow-600" />
                  <h3 className="text-lg font-semibold text-yellow-800">Waiting for Check Out</h3>
                </div>
                <p className="text-gray-700">You are currently checked in. Please check out when you leave.</p>
              </div>
            )}

            {/* Status */}
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-gray-700">
                <strong>Status:</strong>{' '}
                <span className="text-lg font-semibold text-blue-600">{todayStatus.status.toUpperCase()}</span>
              </p>
            </div>

            {/* Check Out Button */}
            {!todayStatus.checkOutTime && (
              <button
                onClick={handleCheckOut}
                disabled={checkingOut}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center space-x-2"
              >
                {checkingOut ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Checking Out...</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-5 h-5" />
                    <span>Check Out Now</span>
                  </>
                )}
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-6">No check-in recorded for today</p>
            <button
              onClick={handleCheckIn}
              disabled={checkingIn}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center space-x-2"
            >
              {checkingIn ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Checking In...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Check In Now</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Instructions</h3>
        <ul className="space-y-2 text-blue-800">
          <li className="flex items-start space-x-2">
            <span className="font-bold">1.</span>
            <span>Click "Check In Now" when you arrive at work</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="font-bold">2.</span>
            <span>Your attendance will be recorded with the current time</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="font-bold">3.</span>
            <span>Click "Check Out Now" when you leave</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="font-bold">4.</span>
            <span>Total hours will be calculated automatically</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default MarkAttendance;
