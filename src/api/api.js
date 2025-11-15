// src/api/api.js
import { useAuthStore } from '../store/authStore';

const API_AUTH = import.meta.env.VITE_API_AUTH_URL;
const API_BRIGADAS = import.meta.env.VITE_API_BRIGADAS_URL;

// Helper para hacer requests con autenticación
const fetchWithAuth = async (url, options = {}) => {
  // Obtener el token del store
  const token = useAuthStore.getState().session?.access_token;

  if (!token) {
    throw new Error('No hay token de autenticación');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Si es 401, el token expiró
  if (response.status === 401) {
    console.error('Token inválido o expirado');
    throw new Error('Token inválido o expirado');
  }

  if (!response.ok) {
    let errorMessage = 'Error en la petición';
    try {
      const error = await response.json();
      errorMessage = error.error || error.message || errorMessage;
    } catch (e) {
      // Si no puede parsear el JSON, usar el status
      errorMessage = `Error ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
};

// ==================== USUARIOS (IFN-AUTH) ====================
export const api = {
  // Auth
  async getUsuarios() {
    return fetchWithAuth(`${API_AUTH}/api/users`);
  },

  async getUsuarioById(id) {
    return fetchWithAuth(`${API_AUTH}/api/users/${id}`);
  },

  async getUsuarioByEmail(correo) {
    return fetchWithAuth(`${API_AUTH}/api/users/correo/${correo}`);
  },

  async crearUsuario(data) {
    return fetchWithAuth(`${API_AUTH}/api/users`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async actualizarUsuario(id, data) {
    return fetchWithAuth(`${API_AUTH}/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async suspenderUsuario(id) {
    return fetchWithAuth(`${API_AUTH}/api/users/${id}/suspender`, {
      method: 'PUT',
    });
  },

  async activarUsuario(id) {
    return fetchWithAuth(`${API_AUTH}/api/users/${id}/activar`, {
      method: 'PUT',
    });
  },

  // ==================== CONGLOMERADOS ====================
  async getConglomerados() {
    return fetchWithAuth(`${API_BRIGADAS}/api/conglomerados`);
  },

  async getConglomeradoById(id) {
    return fetchWithAuth(`${API_BRIGADAS}/api/conglomerados/${id}`);
  },

  async getConglomeradosByEstado(estado) {
    return fetchWithAuth(`${API_BRIGADAS}/api/conglomerados/estado/${estado}`);
  },

  async getConglomeradosDisponibles() {
    return fetchWithAuth(`${API_BRIGADAS}/api/conglomerados/disponibles`);
  },

  async generarConglomerados(cantidad) {
    return fetchWithAuth(`${API_BRIGADAS}/api/conglomerados/generar`, {
      method: 'POST',
      body: JSON.stringify({ cantidad }),
    });
  },

  async aprobarConglomerado(id, departamentoId, asignadoPor) {
    return fetchWithAuth(`${API_BRIGADAS}/api/conglomerados/${id}/aprobar`, {
      method: 'PUT',
      body: JSON.stringify({
        departamento_id: departamentoId,
        asignado_por: asignadoPor,
      }),
    });
  },

  async rechazarConglomerado(id, razon, asignadoPor) {
    return fetchWithAuth(`${API_BRIGADAS}/api/conglomerados/${id}/rechazar`, {
      method: 'PUT',
      body: JSON.stringify({
        razon,
        asignado_por: asignadoPor,
      }),
    });
  },

  async eliminarConglomerado(id) {
    return fetchWithAuth(`${API_BRIGADAS}/api/conglomerados/${id}`, {
      method: 'DELETE',
    });
  },

  async getEstadisticas() {
    return fetchWithAuth(`${API_BRIGADAS}/api/conglomerados/estadisticas`);
  },

  // ==================== SUBPARCELAS ====================
  async getSubparcelasByConglomerado(conglomeradoId) {
    return fetchWithAuth(`${API_BRIGADAS}/api/subparcelas/conglomerado/${conglomeradoId}`);
  },

  async getSubparcelaById(id) {
    return fetchWithAuth(`${API_BRIGADAS}/api/subparcelas/${id}`);
  },

  async actualizarSubparcela(id, data) {
    return fetchWithAuth(`${API_BRIGADAS}/api/subparcelas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // ==================== DEPARTAMENTOS ====================
  async getDepartamentos() {
    return fetchWithAuth(`${API_BRIGADAS}/api/departamentos`);
  },

  async getDepartamentoById(id) {
    return fetchWithAuth(`${API_BRIGADAS}/api/departamentos/${id}`);
  },

  async getDepartamentoByCodigo(codigo) {
    return fetchWithAuth(`${API_BRIGADAS}/api/departamentos/codigo/${codigo}`);
  },

  // ==================== BRIGADAS ====================
  async getBrigadas() {
    return fetchWithAuth(`${API_BRIGADAS}/api/brigadas`);
  },

  async getBrigadaById(id) {
    return fetchWithAuth(`${API_BRIGADAS}/api/brigadas/${id}`);
  },

  async getBrigadasByEstado(estado) {
    return fetchWithAuth(`${API_BRIGADAS}/api/brigadas/estado/${estado}`);
  },

  async crearBrigada(data) {
    return fetchWithAuth(`${API_BRIGADAS}/api/brigadas`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async actualizarBrigada(id, data) {
    return fetchWithAuth(`${API_BRIGADAS}/api/brigadas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async cambiarEstadoBrigada(id, estado) {
    return fetchWithAuth(`${API_BRIGADAS}/api/brigadas/${id}/estado`, {
      method: 'PUT',
      body: JSON.stringify({ estado }),
    });
  },

  async eliminarBrigada(id) {
    return fetchWithAuth(`${API_BRIGADAS}/api/brigadas/${id}`, {
      method: 'DELETE',
    });
  },

  // ==================== BRIGADISTAS ====================
  async getBrigadistas() {
    return fetchWithAuth(`${API_BRIGADAS}/api/brigadistas`);
  },

  async getBrigadistaById(id) {
    return fetchWithAuth(`${API_BRIGADAS}/api/brigadistas/${id}`);
  },

  async getBrigadistasDisponibles() {
    return fetchWithAuth(`${API_BRIGADAS}/api/brigadistas/disponibles`);
  },

  async getBrigadistasByDepartamento(departamentoId) {
    return fetchWithAuth(`${API_BRIGADAS}/api/brigadistas/departamento/${departamentoId}`);
  },

  async invitarBrigadista(correo) {
    return fetchWithAuth(`${API_BRIGADAS}/api/brigadistas/invitar`, {
      method: 'POST',
      body: JSON.stringify({ correo }),
    });
  },

  async completarRegistroBrigadista(data) {
    return fetchWithAuth(`${API_BRIGADAS}/api/brigadistas/registro`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async actualizarBrigadista(id, data) {
    return fetchWithAuth(`${API_BRIGADAS}/api/brigadistas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async suspenderBrigadista(id) {
    return fetchWithAuth(`${API_BRIGADAS}/api/brigadistas/${id}/suspender`, {
      method: 'PUT',
    });
  },

  async activarBrigadista(id) {
    return fetchWithAuth(`${API_BRIGADAS}/api/brigadistas/${id}/activar`, {
      method: 'PUT',
    });
  },

  async eliminarBrigadista(id) {
    return fetchWithAuth(`${API_BRIGADAS}/api/brigadistas/${id}`, {
      method: 'DELETE',
    });
  },

  // ==================== ASIGNACIONES ====================
  async asignarBrigadista(brigadaId, miembroId) {
    return fetchWithAuth(`${API_BRIGADAS}/api/asignaciones/invitar`, {
      method: 'POST',
      body: JSON.stringify({
        brigada_id: brigadaId,
        miembro_id: miembroId,
      }),
    });
  },

  async responderInvitacion(brigadaId, miembroId, aceptada, motivoRechazo = null) {
    return fetchWithAuth(
      `${API_BRIGADAS}/api/asignaciones/${brigadaId}/${miembroId}/responder`,
      {
        method: 'PUT',
        body: JSON.stringify({ aceptada, motivo_rechazo: motivoRechazo }),
      }
    );
  },

  async desasignarBrigadista(brigadaId, miembroId) {
    return fetchWithAuth(`${API_BRIGADAS}/api/asignaciones/${brigadaId}/${miembroId}`, {
      method: 'DELETE',
    });
  },

  async getAsignacionesByBrigada(brigadaId) {
    return fetchWithAuth(`${API_BRIGADAS}/api/asignaciones/brigada/${brigadaId}`);
  },

  async getAsignacionesByMiembro(miembroId) {
    return fetchWithAuth(`${API_BRIGADAS}/api/asignaciones/miembro/${miembroId}`);
  },

  async getInvitacionesPendientes(miembroId) {
    return fetchWithAuth(`${API_BRIGADAS}/api/asignaciones/pendientes/${miembroId}`);
  },
};