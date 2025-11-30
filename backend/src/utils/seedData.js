require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const connectDB = require('../config/database');

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Attendance.deleteMany({});

    // Set registration date to 60 days ago so attendance records are valid
    const registrationDate = new Date();
    registrationDate.setDate(registrationDate.getDate() - 60);

    // Create users
    const users = [
      {
        name: 'John Manager',
        email: 'manager@example.com',
        password: 'password123',
        role: 'manager',
        employeeId: 'MGR001',
        department: 'Management',
        createdAt: registrationDate,
      },
      {
        name: 'Alice Employee',
        email: 'alice@example.com',
        password: 'password123',
        role: 'employee',
        employeeId: 'EMP001',
        department: 'IT',
        createdAt: registrationDate,
      },
      {
        name: 'Bob Employee',
        email: 'bob@example.com',
        password: 'password123',
        role: 'employee',
        employeeId: 'EMP002',
        department: 'HR',
        createdAt: registrationDate,
      },
      {
        name: 'Carol Employee',
        email: 'carol@example.com',
        password: 'password123',
        role: 'employee',
        employeeId: 'EMP003',
        department: 'IT',
        createdAt: registrationDate,
      },
      {
        name: 'David Employee',
        email: 'david@example.com',
        password: 'password123',
        role: 'employee',
        employeeId: 'EMP004',
        department: 'Finance',
        createdAt: registrationDate,
      },
    ];

    // Create users one by one to trigger password hashing
    const createdUsers = [];
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
    }
    console.log('Users created:', createdUsers.length);

    // Create attendance records
    const attendanceRecords = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Generate data for last 60 days (including weekends as working days)
    for (let i = 0; i < 60; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      for (let j = 1; j < createdUsers.length; j++) {
        const userId = createdUsers[j]._id;
        
        // For today, some employees might still be working (no checkout)
        const isToday = date.getTime() === today.getTime();
        const shouldHaveCheckout = !isToday || Math.random() > 0.3; // 70% have checkout even on today
        
        const statuses = ['present', 'absent', 'late', 'half-day'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

        let checkInTime = null;
        let checkOutTime = null;

        if (randomStatus === 'present') {
          checkInTime = new Date(date);
          checkInTime.setHours(9, Math.floor(Math.random() * 30), 0);
          if (shouldHaveCheckout) {
            checkOutTime = new Date(checkInTime);
            checkOutTime.setHours(17, Math.floor(Math.random() * 60), 0);
          }
        } else if (randomStatus === 'late') {
          checkInTime = new Date(date);
          checkInTime.setHours(10, Math.floor(Math.random() * 60), 0);
          if (shouldHaveCheckout) {
            checkOutTime = new Date(checkInTime);
            checkOutTime.setHours(17, Math.floor(Math.random() * 60), 0);
          }
        } else if (randomStatus === 'half-day') {
          checkInTime = new Date(date);
          checkInTime.setHours(9, Math.floor(Math.random() * 30), 0);
          if (shouldHaveCheckout) {
            checkOutTime = new Date(checkInTime);
            checkOutTime.setHours(13, Math.floor(Math.random() * 60), 0);
          }
        } else if (randomStatus === 'absent') {
          // Absent: no check-in or check-out time
          checkInTime = null;
          checkOutTime = null;
        }

        // Calculate total hours
        let totalHours = 0;
        if (checkInTime && checkOutTime) {
          const diffMs = checkOutTime - checkInTime;
          totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
        }

        attendanceRecords.push({
          userId,
          date,
          checkInTime,
          checkOutTime,
          status: randomStatus,
          totalHours,
        });
      }
    }

    await Attendance.insertMany(attendanceRecords);
    console.log('Attendance records created:', attendanceRecords.length);

    console.log('Seed data created successfully!');
    console.log('\nTest Credentials:');
    console.log('Manager - Email: manager@example.com, Password: password123');
    console.log('Employee - Email: alice@example.com, Password: password123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
