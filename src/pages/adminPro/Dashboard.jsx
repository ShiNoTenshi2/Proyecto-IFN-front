// src/pages/adminPro/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { api } from '../../api/api';
import './Dashboard.css';

const Dashboard = () => {
  const [estadisticas, setEstadisticas] = useState(null);
  const [conglomerados, setConglomerados] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [stats, conglos] = await Promise.all([
        api.getEstadisticas(),
        api.getConglomerados()
      ]);
      setEstadisticas(stats);
      setConglomerados(conglos.slice(0, 10));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: 'badge-warning',
      aprobado: 'badge-success',
      rechazado: 'badge-danger'
    };
    return badges[estado] || 'badge-default';
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="loading-container">Cargando...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1 className="page-title">Dashboard AdminPro</h1>
            <p className="page-subtitle">Gestión de conglomerados forestales</p>
          </div>
          <button 
            onClick={() => navigate('/admin-pro/generar')}
            className="btn-primary"
          >
            ➕ Generar Conglomerados
          </button>
        </div>

        {estadisticas && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon stat-icon-primary">📊</div>
              <div className="stat-content">
                <p className="stat-label">Total Generados</p>
                <p className="stat-value">{estadisticas.total}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-warning">⏳</div>
              <div className="stat-content">
                <p className="stat-label">Pendientes</p>
                <p className="stat-value">{estadisticas.pendientes}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-success">✅</div>
              <div className="stat-content">
                <p className="stat-label">Aprobados</p>
                <p className="stat-value">{estadisticas.aprobados}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-danger">❌</div>
              <div className="stat-content">
                <p className="stat-label">Rechazados</p>
                <p className="stat-value">{estadisticas.rechazados}</p>
              </div>
            </div>
          </div>
        )}

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Últimos Conglomerados Generados</h2>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Estado</th>
                  <th>Departamento</th>
                  <th>Coordenadas</th>
                  <th>Fecha Creación</th>
                </tr>
              </thead>
              <tbody>
                {conglomerados.map((c) => (
                  <tr key={c.id}>
                    <td className="font-mono">{c.codigo}</td>
                    <td>
                      <span className={`badge ${getEstadoBadge(c.estado)}`}>
                        {c.estado}
                      </span>
                    </td>
                    <td>{c.departamentos?.nombre || '-'}</td>
                    <td className="text-sm">
                      {c.lat.toFixed(4)}, {c.lon.toFixed(4)}
                    </td>
                    <td>{new Date(c.created_at).toLocaleDateString('es-CO')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card-footer">
            <button 
              onClick={() => navigate('/admin-pro/revisar')}
              className="btn-secondary"
            >
              Ver Todos los Conglomerados →
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;