const express = require('express');
const { getEmployeeDashboard, getManagerDashboard, getManagerDepartmentDetails } = require('../controllers/dashboardController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/employee', auth, authorize(['employee']), getEmployeeDashboard);
router.get('/manager/department', auth, authorize(['manager']), getManagerDepartmentDetails);
router.get('/manager', auth, authorize(['manager']), getManagerDashboard);

module.exports = router;
