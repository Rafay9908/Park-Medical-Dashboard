import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, createRoutesFromElements, Route } from 'react-router-dom';
import Layout from './Layout';
import Main from './pages/Main';
import Clinics from './pages/Clinics';
import Clinicians from './pages/Clinicians';
import RotaDraftGenerator from './pages/RotaDraftGenerator';
import Analytics from './pages/Analytics';
import MainRota from './pages/MainRota';
import ShiftSlotsManagement from './pages/ShiftSlotsManagement';
import HistoricalBooking from './pages/HistoricalBooking';
import TravelCostPlanner from './pages/TravelCostPlanner';
import RotaGenerationSettings from './pages/RotaGenerationSettings';
import PreferencesConstraints from './pages/PreferencesConstraints';
import './index.css';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route index element={<Main />} />
      <Route path="clinics" element={<Clinics />} />
      <Route path="clinicians" element={<Clinicians />} />
      <Route path="rota-draft" element={<RotaDraftGenerator />} />
      <Route path="analytics" element={<Analytics />} />
      <Route path="main-rota" element={<MainRota />} />
      <Route path="shift-slots" element={<ShiftSlotsManagement />} />
      <Route path="historical-booking" element={<HistoricalBooking />} />
      <Route path="travel-cost" element={<TravelCostPlanner />} />
      <Route path="rota-settings" element={<RotaGenerationSettings />} />
      <Route path="preferences-constraints" element={<PreferencesConstraints />} />
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
