// src/pages/adminPro/Dashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { api } from '../../api/api';
import './Dashboard.css';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const Dashboard = () => {
  const [estadisticas, setEstadisticas] = useState(null);
  const [conglomerados, setConglomerados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRow, setSelectedRow] = useState(null);

  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading && conglomerados.length > 0) {
      initMap();
    }
  }, [loading, conglomerados]);

  const fetchData = async () => {
    try {
      const [stats, conglos] = await Promise.all([
        api.getEstadisticas(),
        api.getConglomerados()
      ]);

      setEstadisticas(stats);
      setConglomerados(conglos);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const initMap = () => {
    if (mapRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-74.2973, 4.5709],
      zoom: 4.6
    });

    mapRef.current.on("load", () => {
      const geojson = {
        type: "FeatureCollection",
        features: conglomerados.map((c) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [c.lon, c.lat]
          },
          properties: {
            id: c.id,
            codigo: c.codigo,
            estado: c.estado || "pendiente",
            departamento: c.departamentos?.nombre || "—"
          }
        }))
      };

      mapRef.current.addSource("conglomerados", {
        type: "geojson",
        data: geojson
      });

      // Capa de puntos
      mapRef.current.addLayer({
        id: "puntos-conglomerados",
        type: "circle",
        source: "conglomerados",
        paint: {
          "circle-radius": [
            "case",
            ["==", ["get", "estado"], "pendiente"], 8,
            ["==", ["get", "estado"], "aprobado"], 7,
            ["==", ["get", "estado"], "rechazado"], 7,
            6
          ],
          "circle-color": [
            "match",
            ["get", "estado"],
            "pendiente", "#f59e0b",
            "aprobado", "#22c55e",
            "rechazado", "#ef4444",
            "#7c3aed"
          ],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
          "circle-opacity": 0.9
        }
      });

      // Capa de halo para hover
      mapRef.current.addLayer({
        id: "puntos-halo",
        type: "circle",
        source: "conglomerados",
        paint: {
          "circle-radius": 16,
          "circle-color": "#7c3aed",
          "circle-opacity": 0,
          "circle-stroke-width": 3,
          "circle-stroke-color": "#7c3aed",
          "circle-stroke-opacity": 0
        }
      });

      mapRef.current.on("click", "puntos-conglomerados", (e) => {
        const props = e.features[0].properties;

        new mapboxgl.Popup({
          closeButton: true,
          closeOnClick: false
        })
          .setLngLat(e.lngLat)
          .setHTML(`
            <div style="padding: 0.5rem;">
              <div style="font-size: 0.75rem; color: #a1a1aa; margin-bottom: 0.25rem;">CÓDIGO</div>
              <div style="font-size: 1.1rem; font-weight: 700; color: #7c3aed; margin-bottom: 0.75rem; font-family: monospace;">${props.codigo}</div>
              
              <div style="display: grid; gap: 0.5rem;">
                <div>
                  <div style="font-size: 0.75rem; color: #a1a1aa;">Estado</div>
                  <div style="font-weight: 600; color: ${props.estado === 'aprobado' ? '#22c55e' : props.estado === 'rechazado' ? '#ef4444' : '#f59e0b'};">${props.estado}</div>
                </div>
                <div>
                  <div style="font-size: 0.75rem; color: #a1a1aa;">Departamento</div>
                  <div style="font-weight: 600;">${props.departamento}</div>
                </div>
              </div>
            </div>
          `)
          .addTo(mapRef.current);
      });

      mapRef.current.on("mouseenter", "puntos-conglomerados", () => {
        mapRef.current.getCanvas().style.cursor = "pointer";
      });

      mapRef.current.on("mouseleave", "puntos-conglomerados", () => {
        mapRef.current.getCanvas().style.cursor = "";
      });
    });
  };

  const handleRowClick = (conglo) => {
    setSelectedRow(conglo.id);

    if (mapRef.current) {
      // Zoom al punto
      mapRef.current.flyTo({
        center: [conglo.lon, conglo.lat],
        zoom: 10,
        duration: 1500,
        essential: true
      });

      // Abrir popup
      setTimeout(() => {
        new mapboxgl.Popup({
          closeButton: true,
          closeOnClick: false
        })
          .setLngLat([conglo.lon, conglo.lat])
          .setHTML(`
            <div style="padding: 0.5rem;">
              <div style="font-size: 0.75rem; color: #a1a1aa; margin-bottom: 0.25rem;">CÓDIGO</div>
              <div style="font-size: 1.1rem; font-weight: 700; color: #7c3aed; margin-bottom: 0.75rem; font-family: monospace;">${conglo.codigo}</div>
              
              <div style="display: grid; gap: 0.5rem;">
                <div>
                  <div style="font-size: 0.75rem; color: #a1a1aa;">Estado</div>
                  <div style="font-weight: 600; color: ${conglo.estado === 'aprobado' ? '#22c55e' : conglo.estado === 'rechazado' ? '#ef4444' : '#f59e0b'};">${conglo.estado}</div>
                </div>
                <div>
                  <div style="font-size: 0.75rem; color: #a1a1aa;">Departamento</div>
                  <div style="font-weight: 600;">${conglo.departamentos?.nombre || '—'}</div>
                </div>
              </div>
            </div>
          `)
          .addTo(mapRef.current);
      }, 1600);
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: { class: "badge-warning", icon: "⏳" },
      aprobado: { class: "badge-success", icon: "✓" },
      rechazado: { class: "badge-danger", icon: "✗" },
    };
    return badges[estado] || badges.pendiente;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="loading-container">
          <div className="spinner-large"></div>
          <p>Cargando dashboard...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="dashboard-container">
        
        {/* HEADER */}
        <div className="dashboard-header">
          <div>
            <h1 className="page-title">Dashboard AdminPro</h1>
            <p className="page-subtitle">Gestión de conglomerados forestales</p>
          </div>
          <button 
            onClick={() => navigate('/admin-pro/generar')}
            className="btn-primary"
          >
            <span>➕</span>
            Generar Conglomerados
          </button>
        </div>

        {/* STATS */}
        {estadisticas && (
          <div className="stats-grid">
            <div className="stat-card stat-card-primary">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <p className="stat-label">Total Generados</p>
                <p className="stat-value">{estadisticas.total}</p>
              </div>
              <div className="stat-glow stat-glow-primary"></div>
            </div>

            <div className="stat-card stat-card-warning">
              <div className="stat-icon">⏳</div>
              <div className="stat-content">
                <p className="stat-label">Pendientes</p>
                <p className="stat-value">{estadisticas.pendientes}</p>
              </div>
              <div className="stat-glow stat-glow-warning"></div>
            </div>

            <div className="stat-card stat-card-success">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <p className="stat-label">Aprobados</p>
                <p className="stat-value">{estadisticas.aprobados}</p>
              </div>
              <div className="stat-glow stat-glow-success"></div>
            </div>

            <div className="stat-card stat-card-danger">
              <div className="stat-icon">❌</div>
              <div className="stat-content">
                <p className="stat-label">Rechazados</p>
                <p className="stat-value">{estadisticas.rechazados}</p>
              </div>
              <div className="stat-glow stat-glow-danger"></div>
            </div>
          </div>
        )}

        {/* MAPA */}
        <div className="card map-card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Mapa de Conglomerados</h2>
              <p className="card-subtitle">Distribución geográfica de puntos de muestreo</p>
            </div>
            <div className="map-legend">
              <div className="legend-item">
                <div className="legend-dot legend-pending"></div>
                <span>Pendiente</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot legend-approved"></div>
                <span>Aprobado</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot legend-rejected"></div>
                <span>Rechazado</span>
              </div>
            </div>
          </div>
          <div
            ref={mapContainer}
            className="mapbox-container"
          ></div>
        </div>

        {/* TABLA INTERACTIVA */}
        <div className="card table-card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Últimos Conglomerados</h2>
              <p className="card-subtitle">Haz clic en una fila para ver su ubicación en el mapa</p>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Estado</th>
                  <th>Departamento</th>
                  <th>Coordenadas</th>
                  <th>Fecha</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {conglomerados.slice(0, 10).map((c) => {
                  const badge = getEstadoBadge(c.estado);
                  return (
                    <tr 
                      key={c.id}
                      className={`table-row ${selectedRow === c.id ? 'selected' : ''}`}
                      onClick={() => handleRowClick(c)}
                    >
                      <td className="font-mono codigo-cell">{c.codigo}</td>
                      <td>
                        <span className={`badge ${badge.class}`}>
                          <span className="badge-icon">{badge.icon}</span>
                          {c.estado}
                        </span>
                      </td>
                      <td className="departamento-cell">
                        {c.departamentos?.nombre || '—'}
                      </td>
                      <td className="coords-cell">
                        {c.lat.toFixed(4)}, {c.lon.toFixed(4)}
                      </td>
                      <td className="date-cell">
                        {new Date(c.created_at).toLocaleDateString('es-CO')}
                      </td>
                      <td>
                        <button 
                          className="btn-view-map"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(c);
                          }}
                        >
                          🔍
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="card-footer">
            <button 
              onClick={() => navigate('/admin-pro/revisar')}
              className="btn-secondary"
            >
              Ver Todos los Conglomerados
              <span className="arrow">→</span>
            </button>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default Dashboard;