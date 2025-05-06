import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, createRoutesFromElements, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './Layout';
import Main from './pages/Main';
import Clinics from './pages/Clinics';
import Clinicians from './pages/Clinicians';
import RotaDraftGenerator from './pages/RotaDraftGenerator';
import Analytics from './pages/Analytics';
import MainRota from './pages/MainRota';
import Settings from './pages/Settings';
import HistoricalBooking from './pages/HistoricalBooking';
import TravelCostPlanner from './pages/TravelCostPlanner';
import RotaGenerationSettings from './pages/RotaGenerationSettings';
import PreferencesConstraints from './pages/PreferencesConstraints';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import './index.css';

// Create router configuration
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Protected Routes */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Main />} />
        <Route path="clinics" element={<Clinics />} />
        <Route path="clinicians" element={<Clinicians />} />
        <Route path="rota-draft" element={<RotaDraftGenerator />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="main-rota" element={<MainRota />} />
        <Route path="settings" element={<Settings />} />
        <Route path="historical-booking" element={<HistoricalBooking />} />
        <Route path="travel-cost" element={<TravelCostPlanner />} />
        <Route path="rota-settings" element={<RotaGenerationSettings />} />
        <Route path="preferences-constraints" element={<PreferencesConstraints />} />
      </Route>

      {/* Redirect to login for unknown routes */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Route>
  )
);

// Create root and render app
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);