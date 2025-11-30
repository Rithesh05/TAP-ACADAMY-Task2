const express = require('express');
const {
  checkIn,
  checkOut,
  getTodayStatus,
  getMyHistory,
  getMySummary,
  getAllAttendance,
  getEmployeeAttendance,
  getSummary,
  getTodayStatusAll,
  exportAttendance,
  getMemberAttendanceHistory,
} = require('../controllers/attendanceController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Employee routes
router.post('/checkin', auth, checkIn);
router.post('/checkout', auth, checkOut);
router.get('/today', auth, getTodayStatus);
router.get('/my-history', auth, getMyHistory);
router.get('/my-summary', auth, getMySummary);

// Manager routes
router.get('/all', auth, authorize(['manager']), getAllAttendance);
router.get('/member/:id', auth, authorize(['manager']), getMemberAttendanceHistory);
router.get('/employee/:id', auth, authorize(['manager']), getEmployeeAttendance);
router.get('/summary', auth, authorize(['manager']), getSummary);
router.get('/today-status', auth, authorize(['manager']), getTodayStatusAll);
router.get('/export', auth, authorize(['manager']), exportAttendance);

module.exports = router;
