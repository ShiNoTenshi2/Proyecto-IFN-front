// src/components/layout/AdminLayout.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabaseClient';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      {/* Header */}
      <header className="admin-header">
        <div className="header-left">
          <h1>Sistema IFN</h1>
          <span className="user-role">{user?.rol}</span>
        </div>
        <div className="header-right">
          <span className="user-name">{user?.nombre}</span>
          <button onClick={handleLogout} className="btn-logout">
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="admin-sidebar">
        <nav>
          <button onClick={() => navigate('/admin-pro/dashboard')}>
            📊 Dashboard
          </button>
          <button onClick={() => navigate('/admin-pro/generar')}>
            ➕ Generar
          </button>
          <button onClick={() => navigate('/admin-pro/revisar')}>
            ✅ Revisar
          </button>
        </nav>
      </aside>

      {/* Contenido */}
      <main className="admin-content">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;