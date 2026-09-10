import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import InicioPageRoute from './pages/InicioPageRoute';
import FacturacionPage from './pages/FacturacionPage';
import ServiciosPage from './pages/ServiciosPage';
import SoportePage from './pages/SoportePage';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<InicioPageRoute />} />
          <Route path="facturacion" element={<FacturacionPage />} />
          <Route path="servicios" element={<ServiciosPage />} />
          <Route path="soporte" element={<SoportePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
