// Express.js Airline REST API Backend

const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = 8000;

app.use(bodyParser.json());

let users = [{ id: 1, username: 'testuser', password: 'testpass' }];
let airlines = [];
let aircrafts = [];

const SECRET_KEY = 'superSecret123!';

// Middleware for token validation
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Auth: Get token
app.post('/api-token-auth/', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(403).json({ error: 'Invalid credentials' });

  const accessToken = jwt.sign({ user_id: user.id }, SECRET_KEY, { expiresIn: '1h' });
  res.json({ access: accessToken });
});

// Airlines CRUD
app.post('/airline/', authenticateToken, (req, res) => {
  const { name, callsign, founded_year, base_airport } = req.body;
  if (airlines.find(a => a.name === name)) return res.status(400).json({ error: 'UNIQUE constraint failed: airlines_airline.name' });
  if (airlines.find(a => a.callsign === callsign)) return res.status(400).json({ error: 'UNIQUE constraint failed: airlines_airline.callsign' });

  const airline = { id: airlines.length + 1, name, callsign, founded_year, base_airport, aircraft_set: [] };
  airlines.push(airline);
  res.status(201).json(airline);
});

app.get('/airline/', authenticateToken, (req, res) => {
  res.json(airlines);
});

app.get('/airline/:id/', authenticateToken, (req, res) => {
  const airline = airlines.find(a => a.id == req.params.id);
  if (!airline) return res.status(404).json({ error: 'Not found' });
  res.json(airline);
});

app.patch('/airline/:id/', authenticateToken, (req, res) => {
  const airline = airlines.find(a => a.id == req.params.id);
  if (!airline) return res.status(404).json({ error: 'Not found' });

  const { name, callsign, founded_year, base_airport } = req.body;
  if (name && airlines.find(a => a.name === name && a.id != airline.id)) return res.status(400).json({ error: 'UNIQUE constraint failed: airlines_airline.name' });
  if (callsign && airlines.find(a => a.callsign === callsign && a.id != airline.id)) return res.status(400).json({ error: 'UNIQUE constraint failed: airlines_airline.callsign' });

  Object.assign(airline, { name, callsign, founded_year, base_airport });
  res.json(airline);
});

app.delete('/airline/:id/', authenticateToken, (req, res) => {
  airlines = airlines.filter(a => a.id != req.params.id);
  aircrafts = aircrafts.filter(ac => ac.operator_airline != req.params.id);
  res.sendStatus(204);
});

// Aircrafts CRUD
app.post('/aircraft/', authenticateToken, (req, res) => {
  const { manufacturer_serial_number, type, model, operator_airline, number_of_engines } = req.body;
  if (!operator_airline) return res.status(400).json({ operator_airline: ['This field may not be null.'] });
  if (aircrafts.find(a => a.manufacturer_serial_number === manufacturer_serial_number)) return res.status(400).json({ error: 'UNIQUE constraint failed: airlines_aircraft.manufacturer_serial_number' });

  const aircraft = { id: aircrafts.length + 1, manufacturer_serial_number, type, model, operator_airline, number_of_engines };
  aircrafts.push(aircraft);

  const airline = airlines.find(a => a.id == operator_airline);
  if (airline) airline.aircraft_set.push(aircraft);

  res.status(201).json(aircraft);
});

app.get('/aircraft/:id', authenticateToken, (req, res) => {
  const aircraft = aircrafts.find(a => a.id == req.params.id);
  if (!aircraft) return res.status(404).json({ error: 'Not found' });
  res.json(aircraft);
});

app.patch('/aircraft/:id/', authenticateToken, (req, res) => {
  const aircraft = aircrafts.find(a => a.id == req.params.id);
  if (!aircraft) return res.status(404).json({ error: 'Not found' });

  const { manufacturer_serial_number } = req.body;
  if (manufacturer_serial_number && aircrafts.find(a => a.manufacturer_serial_number === manufacturer_serial_number && a.id != aircraft.id)) {
    return res.status(400).json({ error: 'UNIQUE constraint failed: airlines_aircraft.manufacturer_serial_number' });
  }

  Object.assign(aircraft, req.body);
  res.json(aircraft);
});

app.delete('/aircraft/:id/', authenticateToken, (req, res) => {
  const id = req.params.id;
  aircrafts = aircrafts.filter(a => a.id != id);
  airlines.forEach(a => a.aircraft_set = a.aircraft_set.filter(ac => ac.id != id));
  res.sendStatus(204);
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
