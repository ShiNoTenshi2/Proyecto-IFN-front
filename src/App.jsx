// src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { supabase } from './lib/supabaseClient';

// Auth
import Login from './pages/auth/Login';

// AdminPro
import AdminProDashboard from './pages/adminPro/Dashboard';
import GenerarConglomerados from './pages/adminPro/GenerarConglomerados';
import RevisarConglomerados from './pages/adminPro/RevisarConglomerados';

// AdminBrigadas (comentadas hasta que las tengas)
// import AdminBrigadasDashboard from './pages/adminBrigadas/Dashboard';
// import SolicitudesPendientes from './pages/adminBrigadas/SolicitudesPendientes';
// import GestionBrigadistas from './pages/adminBrigadas/Brigadistas';
// import ConglomeradosYBrigadas from './pages/adminBrigadas/ConglomeradosYBrigadas';

// Brigadista (comentadas hasta que las tengas)
// import BrigadistaDashboard from './pages/brigadista/Dashboard';
// import CompletarRegistro from './pages/brigadista/CompletarRegistro';
// import Perfil from './pages/brigadista/Perfil';

// Componente para rutas protegidas
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

const App = () => {
  const { setAuth, logout } = useAuthStore();

  useEffect(() => {
    // Escuchar cambios en la sesión de Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Usuario se autenticó
          console.log('✅ Sesión iniciada');
        } else if (event === 'SIGNED_OUT') {
          // Usuario cerró sesión
          logout();
        } else if (event === 'TOKEN_REFRESHED') {
          // Token renovado
          console.log('🔄 Token renovado');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [setAuth, logout]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        {/* <Route path="/brigadista/completar-registro" element={<CompletarRegistro />} /> */}
        
        {/* AdminPro */}
        <Route
          path="/admin-pro/dashboard"
          element={
            <ProtectedRoute allowedRoles={['AdminPro']}>
              <AdminProDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-pro/generar"
          element={
            <ProtectedRoute allowedRoles={['AdminPro']}>
              <GenerarConglomerados />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-pro/revisar"
          element={
            <ProtectedRoute allowedRoles={['AdminPro']}>
              <RevisarConglomerados />
            </ProtectedRoute>
          }
        />

        {/* AdminBrigadas - Descomenta cuando las tengas */}
        {/*
        <Route
          path="/admin-brigadas/dashboard"
          element={
            <ProtectedRoute allowedRoles={['AdminBrigadas']}>
              <AdminBrigadasDashboard />
            </ProtectedRoute>
          }
        />
        */}

        {/* Redirecciones */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route 
          path="/unauthorized" 
          element={
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100vh',
              flexDirection: 'column' 
            }}>
              <h1>🚫 No autorizado</h1>
              <p>No tienes permisos para acceder a esta página</p>
              <button onClick={() => window.location.href = '/login'}>
                Volver al login
              </button>
            </div>
          } 
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;