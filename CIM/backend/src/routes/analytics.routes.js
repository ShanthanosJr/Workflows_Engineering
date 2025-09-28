const { Router } = require('express');
const ctrl = require('../controllers/analytics.controller');
const { auth } = require('../middleware/auth');
const r = Router();
r.get('/compliance', auth(false), ctrl.compliance);
r.get('/recurring', auth(false), ctrl.recurring);
r.get('/complaint-stats', auth(false), ctrl.complaintStats);
r.post('/recompute', auth(), ctrl.recompute);
module.exports = r;
