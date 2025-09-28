const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { connectDB } = require('./utils/db');
const api = require('./routes');
const { startJobs } = require('./jobs');

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*'}));
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

connectDB().then(()=>{
  console.log('Mongo connected');
  startJobs();
}).catch(e=>console.error('Mongo error', e));

app.use('/api', api);

app.use((err, req, res, next)=>{
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

module.exports = app;
