const { read, write } = require('../utils/fileHelper');

const getAdminStats = (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

  const users = read('users.json').map(({ password, ...u }) => u);
  const trips = read('trips.json');

  const totalBudget = trips.reduce((s, t) => s + (t.budget?.reduce((a, b) => a + b.cost, 0) || 0), 0);
  const totalActivities = trips.reduce((s, t) => s + (t.itinerary?.reduce((a, c) => a + (c.activities?.length || 0), 0) || 0), 0);
  const totalPackingItems = trips.reduce((s, t) => s + (t.packing?.length || 0), 0);
  const totalJournalEntries = trips.reduce((s, t) => s + (t.journal?.length || 0), 0);

  res.json({
    stats: {
      totalUsers: users.length,
      totalTrips: trips.length,
      totalBudget,
      totalActivities,
      totalPackingItems,
      sharedTrips: trips.length,
      totalJournalEntries,
    },
    users,
    trips,
  });
};

const updateUser = (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  const users = read('users.json');
  const idx = users.findIndex((u) => u.id === req.params.userId);
  if (idx === -1) return res.status(404).json({ message: 'User not found' });
  users[idx] = { ...users[idx], ...req.body };
  write('users.json', users);
  const { password, ...safe } = users[idx];
  res.json(safe);
};

const deleteUser = (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  const users = read('users.json');
  const filtered = users.filter((u) => u.id !== req.params.userId);
  if (filtered.length === users.length) return res.status(404).json({ message: 'User not found' });
  write('users.json', filtered);
  // Also delete their trips
  const trips = read('trips.json').filter((t) => t.userId !== req.params.userId);
  write('trips.json', trips);
  res.json({ message: 'User deleted' });
};

const adminDeleteTrip = (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  const trips = read('trips.json');
  const filtered = trips.filter((t) => t.id !== req.params.tripId);
  if (filtered.length === trips.length) return res.status(404).json({ message: 'Trip not found' });
  write('trips.json', filtered);
  res.json({ message: 'Trip deleted' });
};

module.exports = { getAdminStats, updateUser, deleteUser, adminDeleteTrip };
