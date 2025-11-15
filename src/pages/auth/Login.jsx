// src/pages/auth/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuthStore } from "../../store/authStore";
import "../../styles/login.css";

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setLoading(true);

    try {
      // 1. Login con Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: correo,
        password: password
      });

      if (authError) {
        setMensaje("❌ " + authError.message);
        setLoading(false);
        return;
      }

      // 2. Obtener datos completos del usuario desde el backend
      const userResponse = await fetch(
        `${import.meta.env.VITE_API_AUTH_URL}/api/users/correo/${correo}`,
        {
          headers: {
            'Authorization': `Bearer ${authData.session.access_token}`
          }
        }
      );

      if (!userResponse.ok) {
        throw new Error('Error obteniendo datos del usuario');
      }

      const usuario = await userResponse.json();

      // 3. Verificar que no esté suspendido
      if (usuario.estado === 'suspendido') {
        setMensaje("❌ Usuario suspendido. Contacta al administrador.");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      // 4. Actualizar los user_metadata en Supabase Auth
      // Esto asegura que el token JWT tenga el rol correcto
      try {
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            rol: usuario.rol,
            nombre_completo: usuario.nombre
          }
        });

        if (updateError) {
          console.warn('No se pudieron actualizar los metadatos:', updateError);
        }
      } catch (metaError) {
        console.warn('Error actualizando metadatos:', metaError);
      }

      // 5. Guardar en Zustand
      setAuth(usuario, authData.session);

      setMensaje("✅ Login exitoso");

      // 6. Redirigir según el rol
      setTimeout(() => {
        switch (usuario.rol) {
          case 'AdminPro':
            navigate('/admin-pro/dashboard');
            break;
          case 'AdminBrigadas':
            navigate('/admin-brigadas/dashboard');
            break;
          case 'Brigadista':
            navigate('/brigadista/dashboard');
            break;
          default:
            navigate('/');
        }
      }, 800);

    } catch (error) {
      console.error('Error en login:', error);
      setMensaje("❌ " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <h2 className="login-title">Sistema IFN</h2>
        <p className="login-subtitle">Inventario Forestal Nacional</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Correo electrónico</label>
            <input
              type="email"
              placeholder="tu@correo.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>

          {mensaje && (
            <div className={`login-msg ${mensaje.includes('✅') ? 'success' : 'error'}`}>
              {mensaje}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}