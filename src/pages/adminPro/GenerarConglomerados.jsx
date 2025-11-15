// src/pages/adminPro/GenerarConglomerados.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { api } from '../../api/api';
import './GenerarConglomerados.css';

const GenerarConglomerados = () => {
  const [cantidad, setCantidad] = useState(10);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const navigate = useNavigate();

  const handleGenerar = async () => {
    setLoading(true);
    try {
      const response = await api.generarConglomerados(cantidad);
      setResultado(response);
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="generar-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Generar Conglomerados</h1>
            <p className="page-subtitle">
              Crea nuevos puntos de muestreo con coordenadas aleatorias en Colombia
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="generator-section">
              <div className="slider-container">
                <label className="slider-label">
                  Cantidad de Conglomerados a Generar
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={cantidad}
                  onChange={(e) => setCantidad(parseInt(e.target.value))}
                  className="slider"
                  disabled={loading}
                />
                <div className="cantidad-display">
                  <div className="cantidad-numero">{cantidad}</div>
                  <p className="cantidad-detalle">
                    Se generarán <strong>{cantidad}</strong> conglomerados
                  </p>
                  <p className="cantidad-subdetalle">
                    ({cantidad * 5} subparcelas en total)
                  </p>
                </div>
              </div>

              <div className="info-box">
                <div className="info-icon">ℹ️</div>
                <div className="info-content">
                  <h4 className="info-title">¿Qué se generará?</h4>
                  <ul className="info-list">
                    <li>Coordenadas aleatorias dentro del territorio colombiano</li>
                    <li>5 subparcelas por cada conglomerado (centro + 4 cardinales)</li>
                    <li>Código único para cada conglomerado</li>
                    <li>Estado inicial: "Pendiente de revisión"</li>
                  </ul>
                </div>
              </div>

              <button
                onClick={handleGenerar}
                disabled={loading}
                className="btn-generar"
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Generando...
                  </>
                ) : (
                  <>
                    🌲 Generar {cantidad} Conglomerado{cantidad > 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {resultado && (
          <div className="card resultado-card">
            <div className="card-body">
              <div className="resultado-success">
                <div className="success-icon">✓</div>
                <h2 className="success-title">
                  ¡{resultado.conglomerados.length} Conglomerados Generados Exitosamente!
                </h2>
                <p className="success-message">
                  Los conglomerados han sido creados con sus respectivas subparcelas
                  y están listos para ser revisados.
                </p>

                <div className="resultado-stats">
                  <div className="resultado-stat">
                    <div className="resultado-stat-value">
                      {resultado.conglomerados.length}
                    </div>
                    <div className="resultado-stat-label">Conglomerados</div>
                  </div>
                  <div className="resultado-stat">
                    <div className="resultado-stat-value">
                      {resultado.conglomerados.length * 5}
                    </div>
                    <div className="resultado-stat-label">Subparcelas</div>
                  </div>
                </div>

                <div className="resultado-actions">
                  <button
                    onClick={() => navigate('/admin-pro/revisar')}
                    className="btn-primary"
                  >
                    Ir a Revisar Conglomerados →
                  </button>
                  <button
                    onClick={() => {
                      setResultado(null);
                      setCantidad(10);
                    }}
                    className="btn-secondary"
                  >
                    Generar Más
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

export default GenerarConglomerados;