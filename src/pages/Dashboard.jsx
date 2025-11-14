import { useAuth } from "../context/AuthProvider";

export default function Dashboard() {
  const { userData } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">
        Bienvenido, {userData?.nombre} 👋
      </h1>
      <p className="mt-4">Rol: {userData?.rol}</p>
      <p>Estado: {userData?.estado}</p>
    </div>
  );
}
