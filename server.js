const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/trips', require('./routes/tripRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Health check — visit http://localhost:5000/api/ping to confirm server is running latest code
app.get('/api/ping', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Traveloop backend running on port ${PORT}`));
