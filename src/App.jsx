import { useState } from "react";
import { supabase } from "./lib/supabaseClient";
import "./styles/login.css";

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: correo,
      password: password
    });

    if (error) {
      setMensaje("❌ Credenciales incorrectas o usuario inválido");
      return;
    }

    setMensaje("⭐ Login exitoso");

    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 800);
  };

  
  return (
    <div className="login-bg">
      <div className="login-card">
        <h2 className="login-title">Ingreso al Sistema</h2>

        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            placeholder="Correo institucional"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Ingresar</button>

          {mensaje && <p className="login-msg">{mensaje}</p>}
        </form>
      </div>
    </div>
  );
}
