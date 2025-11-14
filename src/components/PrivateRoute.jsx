import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

export default function PrivateRoute({ children }) {
  const { userData } = useAuth();

  if (!userData) {
    return <Navigate to="/" replace />;
  }

  return children;
}
