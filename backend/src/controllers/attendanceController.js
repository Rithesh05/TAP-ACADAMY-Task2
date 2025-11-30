const Attendance = require('../models/Attendance');
const User = require('../models/User');

// Employee - Check In
exports.checkIn = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let attendance = await Attendance.findOne({
      userId,
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
    });

    if (!attendance) {
      attendance = new Attendance({
        userId,
        date: new Date(),
        checkInTime: new Date(),
        status: 'present',
      });
    } else if (attendance.checkInTime) {
      return res.status(400).json({ message: 'Already checked in today' });
    } else {
      attendance.checkInTime = new Date();
      attendance.status = 'present';
    }

    await attendance.save();

    res.json({
      message: 'Checked in successfully',
      attendance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Employee - Check Out
exports.checkOut = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      userId,
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
    });

    if (!attendance) {
      return res.status(404).json({ message: 'No check-in found for today' });
    }

    if (attendance.checkOutTime) {
      return res.status(400).json({ message: 'Already checked out today' });
    }

    attendance.checkOutTime = new Date();
    // Status and totalHours will be calculated by the pre-save hook in the model
    await attendance.save();

    res.json({
      message: 'Checked out successfully',
      attendance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Employee - Get Today's Status
exports.getTodayStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      userId,
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
    });

    res.json(attendance || { message: 'No attendance record for today' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Employee - Get My History
exports.getMyHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, year } = req.query;

    let query = { userId };

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(year, month, 0);
      endDate.setHours(23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    }

    console.log('getMyHistory - Query:', query);
    const attendance = await Attendance.find(query).sort({ date: -1 });
    console.log('getMyHistory - Found records:', attendance.length);

    // Add real-time status for records with check-in but no check-out
    const enrichedAttendance = attendance.map((record) => {
      const obj = record.toObject();
      
      // If checked in but not checked out, show as "In Progress"
      if (obj.checkInTime && !obj.checkOutTime) {
        obj.checkOutTime = null;
        obj.status = 'present';
        obj.isInProgress = true;
      }
      
      return obj;
    });

    res.json(enrichedAttendance);
  } catch (error) {
    console.error('getMyHistory error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Employee - Get My Summary
exports.getMySummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, year } = req.query;

    const currentYear = year || new Date().getFullYear();
    const currentMonth = month || new Date().getMonth() + 1;
    
    const startDate = new Date(currentYear, currentMonth - 1, 1);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(currentYear, currentMonth, 0);
    endDate.setHours(23, 59, 59, 999);

    console.log('getMySummary - Date range:', startDate, 'to', endDate);
    
    const records = await Attendance.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    });

    console.log('getMySummary - Found records:', records.length);

    const summary = {
      total: records.length,
      present: records.filter((r) => r.status === 'present').length,
      absent: records.filter((r) => r.status === 'absent').length,
      late: records.filter((r) => r.status === 'late').length,
      halfDay: records.filter((r) => r.status === 'half-day').length,
      totalHours: records.reduce((sum, r) => sum + (r.totalHours || 0), 0),
    };

    console.log('getMySummary - Summary:', summary);
    res.json(summary);
  } catch (error) {
    console.error('getMySummary error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Manager - Get All Attendance
exports.getAllAttendance = async (req, res) => {
  try {
    const { employeeId, status, department, startDate, endDate, page = 1, limit = 50 } = req.query;

    let query = {};

    if (employeeId) {
      // Search by employeeId field, not MongoDB _id
      const user = await User.findOne({ employeeId });
      if (user) query.userId = user._id;
    }

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Get all matching records (without pagination first to filter by department)
    let allAttendance = await Attendance.find(query)
      .populate('userId', 'name email employeeId department')
      .sort({ date: -1 });

    // Filter by department if provided
    if (department) {
      allAttendance = allAttendance.filter((record) => record.userId.department === department);
    }

    // Apply pagination
    const skip = (page - 1) * limit;
    const attendance = allAttendance.slice(skip, skip + parseInt(limit));
    const total = allAttendance.length;

    res.json({
      attendance,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Manager - Get Employee Attendance
exports.getEmployeeAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { month, year } = req.query;

    let query = { userId: id };

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.find(query).populate('userId', 'name email employeeId').sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Manager - Get Summary
exports.getSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = {};
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const records = await Attendance.find(query).populate('userId', 'name employeeId department');

    const summary = {
      total: records.length,
      present: records.filter((r) => r.status === 'present').length,
      absent: records.filter((r) => r.status === 'absent').length,
      late: records.filter((r) => r.status === 'late').length,
      halfDay: records.filter((r) => r.status === 'half-day').length,
      byDepartment: {},
    };

    records.forEach((record) => {
      const dept = record.userId.department;
      if (!summary.byDepartment[dept]) {
        summary.byDepartment[dept] = { present: 0, absent: 0, late: 0, halfDay: 0 };
      }
      summary.byDepartment[dept][record.status.replace('-', '')] += 1;
    });

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Manager - Get Today's Status
exports.getTodayStatusAll = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.find({
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
    }).populate('userId', 'name email employeeId department');

    const allEmployees = await User.find({ role: 'employee' });

    const presentIds = new Set(attendance.filter((a) => a.status === 'present').map((a) => a.userId._id.toString()));
    const absentIds = new Set(attendance.filter((a) => a.status === 'absent').map((a) => a.userId._id.toString()));
    const lateIds = new Set(attendance.filter((a) => a.status === 'late').map((a) => a.userId._id.toString()));

    const notMarked = allEmployees.filter((e) => !presentIds.has(e._id.toString()) && !absentIds.has(e._id.toString()) && !lateIds.has(e._id.toString()));

    res.json({
      present: attendance.filter((a) => a.status === 'present'),
      absent: attendance.filter((a) => a.status === 'absent'),
      late: attendance.filter((a) => a.status === 'late'),
      notMarked,
      summary: {
        total: allEmployees.length,
        present: presentIds.size,
        absent: absentIds.size,
        late: lateIds.size,
        notMarked: notMarked.length,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Manager - Export Attendance
exports.exportAttendance = async (req, res) => {
  try {
    const { startDate, endDate, employeeId } = req.query;

    let query = {};

    if (employeeId) {
      query.userId = employeeId;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const attendance = await Attendance.find(query).populate('userId', 'name email employeeId department').sort({ date: -1 });

    const csv = [
      ['Employee ID', 'Name', 'Email', 'Department', 'Date', 'Check In', 'Check Out', 'Status', 'Total Hours'].join(','),
      ...attendance.map((record) =>
        [
          record.userId.employeeId,
          record.userId.name,
          record.userId.email,
          record.userId.department,
          record.date.toISOString().split('T')[0],
          record.checkInTime ? record.checkInTime.toISOString() : 'N/A',
          record.checkOutTime ? record.checkOutTime.toISOString() : 'N/A',
          record.status,
          record.totalHours.toFixed(2),
        ].join(',')
      ),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="attendance.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Manager - Get Member Attendance History
exports.getMemberAttendanceHistory = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('=== Get Member Attendance History ===');
    console.log('Member ID:', id);

    // Get member details
    const member = await User.findById(id);
    console.log('Member found:', member ? member.name : 'Not found');
    
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Get all attendance records for this member
    const history = await Attendance.find({ userId: id }).sort({ date: -1 });
    console.log('Attendance records found:', history.length);

    res.json({
      member: {
        _id: member._id,
        name: member.name,
        email: member.email,
        employeeId: member.employeeId,
        department: member.department,
        phoneNumber: member.phoneNumber,
      },
      history,
    });
  } catch (error) {
    console.error('Member attendance history error:', error);
    res.status(500).json({ message: error.message });
  }
};
