const Attendance = require('../models/Attendance');
const User = require('../models/User');

// Employee Dashboard
exports.getEmployeeDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('=== Employee Dashboard Request ===');
    console.log('User ID:', userId);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Today's status
    const todayAttendance = await Attendance.findOne({
      userId,
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
    });
    console.log('Today attendance:', todayAttendance);

    // Current month summary
    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);
    
    console.log('Date range:', startOfMonth, 'to', endOfMonth);

    const monthRecords = await Attendance.find({
      userId,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    console.log('Month records count:', monthRecords.length);
    console.log('Month records:', monthRecords);

    const monthSummary = {
      present: monthRecords.filter((r) => r.status === 'present').length,
      absent: monthRecords.filter((r) => r.status === 'absent').length,
      late: monthRecords.filter((r) => r.status === 'late').length,
      halfDay: monthRecords.filter((r) => r.status === 'half-day').length,
      totalHours: monthRecords.reduce((sum, r) => sum + (r.totalHours || 0), 0),
    };

    console.log('Month summary:', monthSummary);

    // Last 7 days
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentRecords = await Attendance.find({
      userId,
      date: { $gte: sevenDaysAgo, $lte: new Date() },
    }).sort({ date: -1 });

    console.log('Recent records count:', recentRecords.length);

    res.json({
      todayStatus: todayAttendance || { message: 'No record for today' },
      monthSummary,
      recentAttendance: recentRecords,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Manager Dashboard
exports.getManagerDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfToday = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    // Total employees
    const totalEmployees = await User.countDocuments({ role: 'employee' });

    // Today's attendance
    const todayAttendance = await Attendance.find({
      date: { $gte: today, $lte: endOfToday },
    }).populate('userId', 'name email employeeId department');

    const presentCount = todayAttendance.filter((a) => a.status === 'present').length;
    const absentCount = todayAttendance.filter((a) => a.status === 'absent').length;
    const lateCount = todayAttendance.filter((a) => a.status === 'late').length;

    // Currently working (checked in but not checked out)
    const currentlyWorking = todayAttendance
      .filter((a) => a.checkInTime && !a.checkOutTime)
      .map((a) => ({
        ...a.toObject(),
        userName: a.userId.name,
        userEmail: a.userId.email,
        department: a.userId.department,
        checkInTime: a.checkInTime,
      }));

    // Weekly trend (last 7 days)
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const dayRecords = await Attendance.find({
        date: { $gte: dayStart, $lte: dayEnd },
      });

      weeklyData.push({
        date: dayStart.toISOString().split('T')[0],
        present: dayRecords.filter((r) => r.status === 'present').length,
        absent: dayRecords.filter((r) => r.status === 'absent').length,
        late: dayRecords.filter((r) => r.status === 'late').length,
      });
    }

    // Department-wise attendance
    const allRecords = await Attendance.find({
      date: { $gte: today, $lte: endOfToday },
    }).populate('userId', 'department');

    const departmentStats = {};
    allRecords.forEach((record) => {
      const dept = record.userId.department;
      if (!departmentStats[dept]) {
        departmentStats[dept] = { present: 0, absent: 0, late: 0 };
      }
      departmentStats[dept][record.status] = (departmentStats[dept][record.status] || 0) + 1;
    });

    // Absent employees
    const allEmployees = await User.find({ role: 'employee' });
    const presentIds = new Set(todayAttendance.map((a) => a.userId._id.toString()));
    const absentEmployees = allEmployees.filter((e) => !presentIds.has(e._id.toString()));

    // Create a map of today's attendance by userId for easier lookup
    const attendanceMap = {};
    todayAttendance.forEach((att) => {
      attendanceMap[att.userId._id.toString()] = att.status;
    });

    // All employees with today's status
    const allEmployeesWithStatus = allEmployees.map((emp) => ({
      _id: emp._id,
      name: emp.name,
      email: emp.email,
      department: emp.department,
      status: attendanceMap[emp._id.toString()] || 'not-marked',
    }));
    
    console.log('All employees:', allEmployees.length);
    console.log('Today attendance:', todayAttendance.length);
    console.log('All employees with status:', allEmployeesWithStatus);

    res.json({
      totalEmployees,
      todayStats: {
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        notMarked: totalEmployees - todayAttendance.length,
      },
      currentlyWorking,
      weeklyTrend: weeklyData,
      departmentStats,
      absentEmployees,
      allEmployeesWithStatus,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Manager's Department Details (All Employees under Manager)
exports.getManagerDepartmentDetails = async (req, res) => {
  try {
    const managerDepartment = req.user.department;
    console.log('=== Manager Department Details Request ===');
    console.log('Manager:', req.user.name, 'Department:', managerDepartment);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfToday = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    // Get all employees (all employees are under manager's supervision)
    const departmentEmployees = await User.find({
      role: 'employee',
    });
    console.log('Total employees found:', departmentEmployees.length);

    // Get today's attendance for all employees
    const todayAttendance = await Attendance.find({
      date: { $gte: today, $lte: endOfToday },
      userId: { $in: departmentEmployees.map((e) => e._id) },
    });
    console.log('Today attendance records:', todayAttendance.length);

    // Create attendance map
    const attendanceMap = {};
    todayAttendance.forEach((att) => {
      attendanceMap[att.userId.toString()] = att.status;
    });

    // Build department details with employee status
    const departmentDetails = {
      departmentName: managerDepartment,
      totalEmployees: departmentEmployees.length,
      employees: departmentEmployees.map((emp) => ({
        _id: emp._id,
        name: emp.name,
        email: emp.email,
        employeeId: emp.employeeId,
        department: emp.department,
        phoneNumber: emp.phoneNumber,
        status: attendanceMap[emp._id.toString()] || 'not-marked',
      })),
      stats: {
        present: todayAttendance.filter((a) => a.status === 'present').length,
        absent: todayAttendance.filter((a) => a.status === 'absent').length,
        late: todayAttendance.filter((a) => a.status === 'late').length,
        halfDay: todayAttendance.filter((a) => a.status === 'half-day').length,
        notMarked: departmentEmployees.length - todayAttendance.length,
      },
    };

    console.log('Department details:', departmentDetails);
    res.json(departmentDetails);
  } catch (error) {
    console.error('Department details error:', error);
    res.status(500).json({ message: error.message });
  }
};
