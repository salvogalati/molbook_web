import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    // Questo callback viene eseguito **una sola volta**, **subito**,
    // alla prima render, e restituisce il valore iniziale di `user`.
    const token = localStorage.getItem('access_token');
    return token
      ? { access: token }  // se c'è token, l'utente è considerato loggato
      : null;              // altrimenti rimane null
  });

  const login = async (creds) => {
    // chiama l’API Django per ottenere il token
    // const res = await fetch('/api/token/', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(creds)
    // });
    // if (res.ok) {
    //   const { access, refresh } = await res.json();
    //   localStorage.setItem('access_token', access);
    //   localStorage.setItem('refresh_token', refresh);
    //   setUser({ access });
    //   navigate('/home');
    // } else {
    //   throw new Error('Credenziali non valide');
    // }

    // mock delle token
  if (creds.username === 'demo' && creds.password === '123456') {
    const dummyAccess  = 'access';
    const dummyRefresh = 'refresh';

    // Salvo i token in localStorage
    localStorage.setItem('access_token', dummyAccess);
    localStorage.setItem('refresh_token', dummyRefresh);

    // Aggiorno lo stato React
    setUser({ access: dummyAccess });

    // Promise risolta → login ok
    return;
  } else {
    // Promise rigettata → login fallito
    throw new Error('Credenziali non valide');
  }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    navigate('/login');
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
