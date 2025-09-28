const { Router } = require('express');
const ctrl = require('../controllers/complaints.controller');
const { auth } = require('../middleware/auth');
const r = Router();
r.get('/', auth(false), ctrl.list);
r.post('/', auth(false), ctrl.create);
r.get('/ticket/:ticket', auth(false), ctrl.getByTicket);
r.patch('/:id', auth(), ctrl.update);
module.exports = r;
