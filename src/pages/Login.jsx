import { useState } from "react";
import supabase from "../lib/supabaseClient";

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    console.log("SUPABASE URL:", import.meta.env.VITE_SUPABASE_URL);
    console.log("SUPABASE KEY:", import.meta.env.VITE_SUPABASE_ANON_KEY);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: correo,
      password: password,
    });

    if (error) {
      alert("Error: " + error.message);
      return;
    }

    alert("Login exitoso ⭐");
    console.log(data);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Correo"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
        />
        <br />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <button type="submit">Ingresar</button>
      </form>
    </div>
  );
}
