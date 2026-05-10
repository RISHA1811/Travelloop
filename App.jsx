import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

import Landing from './pages/Landing';
import ForgotPassword from './pages/ForgotPassword';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import MyTrips from './pages/MyTrips';
import CreateTrip from './pages/CreateTrip';
import TripDetail from './pages/TripDetail';
import ItineraryBuilder from './pages/ItineraryBuilder';
import ItineraryView from './pages/ItineraryView';
import CityScreen from './pages/CityScreen';
import ActivityScreen from './pages/ActivityScreen';
import BudgetScreen from './pages/BudgetScreen';
import PackingScreen from './pages/PackingScreen';
import PublicTrip from './pages/PublicTrip';
import ProfileSettings from './pages/ProfileSettings';
import Journal from './pages/Journal';
import AdminDashboard from './pages/AdminDashboard';
import Notifications from './pages/Notifications';
import BudgetPlanner from './pages/BudgetPlanner';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/landing" />;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/landing" />;
  if (user.role !== 'admin') return <Navigate to="/" />;
  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to="/" /> : children;
};

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            {/* Landing — accessible to everyone */}
            <Route path="/landing" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/share/:shareId" element={<PublicTrip />} />

            {/* Private */}
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/my-trips" element={<PrivateRoute><MyTrips /></PrivateRoute>} />
            <Route path="/create" element={<PrivateRoute><CreateTrip /></PrivateRoute>} />
            <Route path="/trip/:id" element={<PrivateRoute><TripDetail /></PrivateRoute>} />
            <Route path="/trip/:id/itinerary/build" element={<PrivateRoute><ItineraryBuilder /></PrivateRoute>} />
            <Route path="/trip/:id/itinerary" element={<PrivateRoute><ItineraryView /></PrivateRoute>} />
            <Route path="/trip/:id/city/:cityIdx" element={<PrivateRoute><CityScreen /></PrivateRoute>} />
            <Route path="/trip/:id/city/:cityIdx/activity/:actIdx" element={<PrivateRoute><ActivityScreen /></PrivateRoute>} />
            <Route path="/trip/:id/budget" element={<PrivateRoute><BudgetScreen /></PrivateRoute>} />
            <Route path="/trip/:id/packing" element={<PrivateRoute><PackingScreen /></PrivateRoute>} />
            <Route path="/journal" element={<PrivateRoute><Journal /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><ProfileSettings /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><ProfileSettings /></PrivateRoute>} />
            <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
            <Route path="/budget-planner" element={<PrivateRoute><BudgetPlanner /></PrivateRoute>} />
            <Route path="/budget" element={<PrivateRoute><BudgetPlanner /></PrivateRoute>} />

            {/* Admin */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/landing" />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}
