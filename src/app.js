const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const env = require('./config/env');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();


app.use(express.json());
app.use(cookieParser());

app.use(routes);

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://front-easy.vercel.app",
     env.WEB_URL 
    
  ],
  credentials: true
}));

app.use((req, res) => res.status(404).json({ error: 'Route introuvable' }));
app.use(errorHandler); // toujours en dernier

module.exports = app;