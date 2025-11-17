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

  const mapContainer = useRef(null);
  const mapRef = useRef(null);

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
      style: "mapbox://styles/mapbox/streets-v12",
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

      mapRef.current.addLayer({
        id: "puntos-conglomerados",
        type: "circle",
        source: "conglomerados",
        paint: {
          "circle-radius": 6,
          "circle-color": [
            "match",
            ["get", "estado"],
            "pendiente", "#f1c40f",
            "aprobado", "#2ecc71",
            "rechazado", "#e74c3c",
            "#3498db"
          ],
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "#ffffff"
        }
      });

      mapRef.current.on("click", "puntos-conglomerados", (e) => {
        const props = e.features[0].properties;

        new mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(`
            <div style="font-size:14px">
              <b>Código:</b> ${props.codigo}<br/>
              <b>Estado:</b> ${props.estado}<br/>
              <b>Departamento:</b> ${props.departamento}
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

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: "badge-warning",
      aprobado: "badge-success",
      rechazado: "badge-danger",
    };
    return badges[estado] || "badge-default";
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
            ➕ Generar Conglomerados
          </button>
        </div>

        {/* STATS */}
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

        {/* MAPA */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Mapa de Conglomerados</h2>
          </div>
          <div
            ref={mapContainer}
            className="mapbox-container"
            style={{ height: "400px", borderRadius: "12px", overflow: "hidden" }}
          ></div>
        </div>

        {/* TABLA */}
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
                {conglomerados.slice(0, 10).map((c) => (
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
