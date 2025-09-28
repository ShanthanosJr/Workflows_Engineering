const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const r = Router();

r.post('/register',[
  body('username').isString().notEmpty(),
  body('password').isLength({min:6}),
  body('name').isString().notEmpty(),
  body('role').isIn(['ADMIN','WORKER'])
], async (req,res)=>{
  const errors = validationResult(req);
  if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { username, password, name, birthdate, role } = req.body;
  const exists = await User.findOne({ username });
  if(exists) return res.status(400).json({ error: 'Username already exists' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ username, passwordHash, name, birthdate, role });
  res.json({ id:user._id, username:user.username });
});

r.post('/login',[
  body('username').notEmpty(),
  body('password').notEmpty()
], async (req,res)=>{
  const errors = validationResult(req);
  if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if(!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if(!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id:user._id, username:user.username, role:user.role, name:user.name }, process.env.JWT_SECRET || 'change_me', { expiresIn: '12h' });
  res.json({ token, role: user.role, name: user.name });
});

r.get('/me', auth(false), (req,res)=> res.json({ user: req.user || null }));

module.exports = r;
