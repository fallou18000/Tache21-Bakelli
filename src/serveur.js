const app = require('./app');
const cors = require('cors');


app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://front-easy.vercel.app",
     
  ],
  credentials: true
}));

app.listen(3000, () => console.log('API sur http://localhost:3000'));