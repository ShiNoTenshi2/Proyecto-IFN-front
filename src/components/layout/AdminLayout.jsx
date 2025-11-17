// src/components/layout/AdminLayout.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabaseClient';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/admin-pro/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin-pro/generar', label: 'Generar', icon: '➕' },
    { path: '/admin-pro/revisar', label: 'Revisar', icon: '✅' }
  ];

  return (
    <div className="admin-layout">
      {/* NAVBAR TOP */}
      <nav className="admin-navbar">
        <div className="navbar-container">
          {/* Logo / Brand */}
          <div className="navbar-brand">
            <div className="brand-icon">🌲</div>
            <div className="brand-text">
              <h1 className="brand-title">IFN Sistema</h1>
              <span className="brand-subtitle">Inventario Forestal</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="navbar-links">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
              >
                <span className="nav-icon">{link.icon}</span>
                <span className="nav-label">{link.label}</span>
              </button>
            ))}
          </div>

          {/* User Menu */}
          <div className="navbar-user">
            <button 
              className="user-button"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="user-avatar">
                {user?.nombre?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="user-info">
                <span className="user-name">{user?.nombre || 'Usuario'}</span>
                <span className="user-role">{user?.rol || 'Admin'}</span>
              </div>
              <svg 
                className={`chevron ${showUserMenu ? 'rotate' : ''}`}
                width="20" 
                height="20" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="user-dropdown">
                <div className="dropdown-item user-dropdown-info">
                  <div className="dropdown-label">Usuario</div>
                  <div className="dropdown-value">{user?.nombre}</div>
                </div>
                <div className="dropdown-item user-dropdown-info">
                  <div className="dropdown-label">Email</div>
                  <div className="dropdown-value">{user?.email}</div>
                </div>
                <div className="dropdown-divider"></div>
                <button 
                  className="dropdown-item dropdown-button logout"
                  onClick={handleLogout}
                >
                  <span>🚪</span>
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* CONTENT */}
      <main className="admin-content">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;