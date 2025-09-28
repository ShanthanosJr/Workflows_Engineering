require('dotenv').config();
const http = require('http');
const app = require('./app');
const PORT = process.env.PORT || 4000;
http.createServer(app).listen(PORT, () => console.log(`Backend on http://localhost:${PORT}`));
