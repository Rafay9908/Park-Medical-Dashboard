import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, createRoutesFromElements, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import {ClinicsProvider} from './context/ClinicsContext';
import {CliniciansProvider} from './context/CliniciansContext';
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

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />

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
        <Route path="travel-cost-planner" element={<TravelCostPlanner />} />
        <Route path="rota-settings" element={<RotaGenerationSettings />} />
        <Route path="preferences-constraints" element={<PreferencesConstraints />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Route>
  )
);

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <AuthProvider>
      <ClinicsProvider>
      <CliniciansProvider>
        <RouterProvider router={router} />
      </CliniciansProvider>
      </ClinicsProvider>
    </AuthProvider>
  </React.StrictMode>
);