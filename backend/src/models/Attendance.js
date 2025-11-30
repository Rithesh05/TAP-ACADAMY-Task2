const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    checkInTime: {
      type: Date,
      default: null,
    },
    checkOutTime: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'half-day'],
      default: 'absent',
    },
    totalHours: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Compound index for unique attendance per user per date
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

// Calculate total hours and status before saving
attendanceSchema.pre('save', function (next) {
  if (this.checkInTime && this.checkOutTime) {
    const diffMs = this.checkOutTime - this.checkInTime;
    const diffHours = diffMs / (1000 * 60 * 60);
    this.totalHours = parseFloat(diffHours.toFixed(2));

    // Determine status based on check-in time and hours worked
    const checkInHour = this.checkInTime.getHours();
    const LATE_THRESHOLD = 9; // 9 AM
    const HALF_DAY_THRESHOLD = 4; // 4 hours

    if (diffHours < HALF_DAY_THRESHOLD) {
      this.status = 'half-day';
    } else if (checkInHour >= LATE_THRESHOLD) {
      this.status = 'late';
    } else {
      this.status = 'present';
    }
  } else if (this.checkInTime && !this.checkOutTime) {
    // Still working - keep as present
    this.status = 'present';
  }
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);
