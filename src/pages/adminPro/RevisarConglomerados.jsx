// src/pages/adminPro/RevisarConglomerados.jsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { api } from '../../api/api';
import { useAuthStore } from '../../store/authStore';
//import './RevisarConglomerados.css';

const RevisarConglomerados = () => {
  const [conglomerados, setConglomerados] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedConglo, setSelectedConglo] = useState(null);
  const [departamentos, setDepartamentos] = useState([]);
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState('');
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const { user } = useAuthStore();

  useEffect(() => {
    fetchData();
  }, [filtro]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [conglos, deptos] = await Promise.all([
        filtro === 'todos' 
          ? api.getConglomerados()
          : api.getConglomeradosByEstado(filtro),
        api.getDepartamentos()
      ]);
      setConglomerados(conglos);
      setDepartamentos(deptos);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar datos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAprobar = async () => {
    if (!departamentoSeleccionado) {
      alert('Selecciona un departamento');
      return;
    }

    try {
      await api.aprobarConglomerado(selectedConglo.id, departamentoSeleccionado, user.id);
      alert('✅ Conglomerado aprobado exitosamente');
      setShowModal(false);
      setDepartamentoSeleccionado('');
      fetchData();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleRechazar = async () => {
    if (!motivoRechazo.trim()) {
      alert('Debes escribir el motivo del rechazo');
      return;
    }

    try {
      await api.rechazarConglomerado(selectedConglo.id, motivoRechazo, user.id);
      alert('❌ Conglomerado rechazado');
      setShowModal(false);
      setMotivoRechazo('');
      fetchData();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const conglomeradosFiltrados = conglomerados.filter(c =>
    c.codigo.toLowerCase().includes(busqueda.toLowerCase())
  );

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: { class: 'badge-warning', label: 'Pendiente' },
      aprobado: { class: 'badge-success', label: 'Aprobado' },
      rechazado: { class: 'badge-danger', label: 'Rechazado' }
    };
    return badges[estado] || badges.pendiente;
  };

  return (
    <AdminLayout>
      <div className="revisar-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Revisar Conglomerados</h1>
            <p className="page-subtitle">
              Aprueba o rechaza los conglomerados generados
            </p>
          </div>
        </div>

        <div className="filters-section">
          <div className="filter-buttons">
            {['todos', 'pendiente', 'aprobado', 'rechazado'].map(f => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`filter-btn ${filtro === f ? 'active' : ''}`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div className="search-box">
            <input
              type="text"
              placeholder="🔍 Buscar por código..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Cargando conglomerados...</div>
        ) : conglomeradosFiltrados.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p className="empty-text">No se encontraron conglomerados</p>
          </div>
        ) : (
          <div className="conglo-grid">
            {conglomeradosFiltrados.map(c => {
              const badge = getEstadoBadge(c.estado);
              return (
                <div key={c.id} className="conglo-card">
                  <div className="conglo-header">
                    <h3 className="conglo-codigo">{c.codigo}</h3>
                    <span className={`badge ${badge.class}`}>
                      {badge.label}
                    </span>
                  </div>

                  <div className="conglo-body">
                    <div className="conglo-info-row">
                      <span className="info-label">📍 Latitud:</span>
                      <span className="info-value">{c.lat.toFixed(6)}</span>
                    </div>
                    <div className="conglo-info-row">
                      <span className="info-label">📍 Longitud:</span>
                      <span className="info-value">{c.lon.toFixed(6)}</span>
                    </div>
                    {c.departamentos && (
                      <div className="conglo-info-row">
                        <span className="info-label">🏛️ Departamento:</span>
                        <span className="info-value">{c.departamentos.nombre}</span>
                      </div>
                    )}
                    {c.razon_rechazo && (
                      <div className="conglo-rechazo">
                        <span className="rechazo-label">❌ Motivo:</span>
                        <p className="rechazo-text">{c.razon_rechazo}</p>
                      </div>
                    )}
                    <div className="conglo-info-row">
                      <span className="info-label">📅 Creado:</span>
                      <span className="info-value">
                        {new Date(c.created_at).toLocaleDateString('es-CO')}
                      </span>
                    </div>
                  </div>

                  {c.estado === 'pendiente' && (
                    <div className="conglo-actions">
                      <button
                        onClick={() => {
                          setSelectedConglo(c);
                          setModalType('aprobar');
                          setShowModal(true);
                        }}
                        className="btn-aprobar"
                      >
                        ✓ Aprobar
                      </button>
                      <button
                        onClick={() => {
                          setSelectedConglo(c);
                          setModalType('rechazar');
                          setShowModal(true);
                        }}
                        className="btn-rechazar"
                      >
                        ✗ Rechazar
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Aprobar/Rechazar */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">
                  {modalType === 'aprobar' ? '✅ Aprobar Conglomerado' : '❌ Rechazar Conglomerado'}
                </h2>
                <button 
                  className="modal-close"
                  onClick={() => setShowModal(false)}
                >
                  ×
                </button>
              </div>

              <div className="modal-body">
                <div className="modal-info">
                  <p className="modal-label">Código del Conglomerado:</p>
                  <p className="modal-value">{selectedConglo?.codigo}</p>
                </div>

                {modalType === 'aprobar' ? (
                  <div className="form-group">
                    <label className="form-label">Selecciona el Departamento *</label>
                    <select
                      value={departamentoSeleccionado}
                      onChange={(e) => setDepartamentoSeleccionado(e.target.value)}
                      className="form-select"
                    >
                      <option value="">-- Seleccionar --</option>
                      {departamentos.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.nombre} ({d.codigo})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="form-group">
                    <label className="form-label">Motivo del Rechazo *</label>
                    <textarea
                      value={motivoRechazo}
                      onChange={(e) => setMotivoRechazo(e.target.value)}
                      className="form-textarea"
                      rows="4"
                      placeholder="Explica por qué se rechaza este conglomerado..."
                    />
                  </div>
                )}

                <div className="modal-actions">
                  <button
                    onClick={() => setShowModal(false)}
                    className="btn-cancel"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={modalType === 'aprobar' ? handleAprobar : handleRechazar}
                    className={modalType === 'aprobar' ? 'btn-confirm-success' : 'btn-confirm-danger'}
                  >
                    {modalType === 'aprobar' ? 'Confirmar Aprobación' : 'Confirmar Rechazo'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default RevisarConglomerados;