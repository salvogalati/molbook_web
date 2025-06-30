import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { API_URL } from "../api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  // 1) Stato dei token
  const [authTokens, setAuthTokens] = useState(() => {
    const access = localStorage.getItem("access_token");
    const refresh = localStorage.getItem("refresh_token");
    return access && refresh ? { access, refresh } : null;
  });

  // 2) Stato dell'utente (decodificato dal JWT)
  const [user, setUser] = useState(() =>
    authTokens ? jwtDecode(authTokens.access) : null
  );

  const login = async (creds) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: creds.username,
          password: creds.password,
        }),
      });

      if (!res.ok) {
        let errBody = null;
        try {
          errBody = await res.json();
        } catch {
          errBody = null;
        }

        const msg =
          errBody?.detail ||
          (Array.isArray(errBody?.non_field_errors) &&
            errBody.non_field_errors[0]) ||
          "Credentials not valid";
        throw new Error(msg);
      }

      const data = await res.json();
      // parsing e salvataggio token
      setAuthTokens({ access: data.access, refresh: data.refresh });
      setUser(jwtDecode(data.access));
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      navigate("/home", { replace: true });
    } catch (error) {
      console.error("Login fallito:", error);
      throw error; // o gestiscilo qui, ad es. mostrando un toast
    }
  };

  // 5) Effetto per refresh automatico
  useEffect(() => {
    if (!authTokens) return;
    // Decodifica la scadenza (exp in secondi)
    const { exp } = jwtDecode(authTokens.access);
    const expiresMs = exp * 1000 - Date.now();
    // programma un refresh 1 minuto prima della scadenza
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/api/jwt/refresh/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh: authTokens.refresh }),
        });
        if (!res.ok) throw new Error("Refresh token scaduto");
        const { access } = await res.json();
        // aggiorna token e utente
        const newTokens = { ...authTokens, access };
        setAuthTokens(newTokens);
        setUser(jwtDecode(access));
        localStorage.setItem("access_token", access);
      } catch {
        logout();
      }
    }, Math.max(expiresMs - 60_000, 0)); // almeno 0

    return () => clearTimeout(timeout);
  }, [authTokens]);

  const logout = () => {
    // 1) cancella sia user che authTokens
    setAuthTokens(null);
    setUser(null);
    // 2) pulisci il LocalStorage
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    navigate("/login", { replace: true });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
