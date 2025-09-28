const { Router } = require('express');
const { exportInspectionsCSV, exportInspectionsPDF, exportComplaintsCSV, exportComplaintsPDF } = require('../controllers/reports.controller');
const { auth } = require('../middleware/auth');
const r = Router();
r.get('/inspections.csv', auth(false), exportInspectionsCSV);
r.get('/inspections.pdf', auth(false), exportInspectionsPDF);
r.get('/complaints.csv', auth(false), exportComplaintsCSV);
r.get('/complaints.pdf', auth(false), exportComplaintsPDF);
module.exports = r;
