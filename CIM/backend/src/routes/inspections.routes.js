const { Router } = require('express');
const ctrl = require('../controllers/inspections.controller');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { auth, allow } = require('../middleware/auth');
const r = Router();

r.get('/schedules', auth(false), ctrl.listSchedules);
r.post('/schedules', auth(), allow('ADMIN'), ctrl.createSchedule);
r.patch('/schedules/:id', auth(), allow('ADMIN'), ctrl.updateSchedule);
r.post('/:id/result', auth(), allow('ADMIN'), upload.array('attachments',5), ctrl.postResult);
r.get('/alerts', auth(false), ctrl.alerts);

module.exports = r;
