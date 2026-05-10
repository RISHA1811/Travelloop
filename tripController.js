const { v4: uuidv4 } = require('uuid');
const { read, write } = require('../utils/fileHelper');

const getTrips = (req, res) => {
  const trips = read('trips.json').filter((t) => t.userId === req.user.id);
  res.json(trips);
};

const getTripById = (req, res) => {
  const trip = read('trips.json').find((t) => t.id === req.params.id);
  if (!trip) return res.status(404).json({ message: 'Trip not found' });
  res.json(trip);
};

const getPublicTrip = (req, res) => {
  const trip = read('trips.json').find((t) => t.shareId === req.params.shareId);
  if (!trip) return res.status(404).json({ message: 'Trip not found' });
  res.json(trip);
};

const createTrip = (req, res) => {
  const { name, startDate, endDate, description, coverEmoji } = req.body;
  if (!name) return res.status(400).json({ message: 'Trip name required' });

  const trip = {
    id: uuidv4(),
    shareId: uuidv4(),
    userId: req.user.id,
    name,
    startDate,
    endDate,
    description,
    coverEmoji: coverEmoji || '✈️',
    itinerary: [],
    budget: [],
    packing: [],
    collaborators: [],
    notes: '',
    createdAt: new Date().toISOString(),
  };

  const trips = read('trips.json');
  trips.push(trip);
  write('trips.json', trips);
  res.status(201).json(trip);
};

const updateTrip = (req, res) => {
  const trips = read('trips.json');
  const idx = trips.findIndex((t) => t.id === req.params.id && t.userId === req.user.id);
  if (idx === -1) return res.status(404).json({ message: 'Trip not found' });

  trips[idx] = { ...trips[idx], ...req.body, id: trips[idx].id, userId: trips[idx].userId };
  write('trips.json', trips);
  res.json(trips[idx]);
};

const deleteTrip = (req, res) => {
  const trips = read('trips.json');
  const filtered = trips.filter((t) => !(t.id === req.params.id && t.userId === req.user.id));
  if (filtered.length === trips.length) return res.status(404).json({ message: 'Trip not found' });
  write('trips.json', filtered);
  res.json({ message: 'Trip deleted' });
};

module.exports = { getTrips, getTripById, getPublicTrip, createTrip, updateTrip, deleteTrip };
