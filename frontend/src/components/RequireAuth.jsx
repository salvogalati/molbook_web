import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireAuth({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) {
    // salva la rotta desiderata e rimanda a login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
