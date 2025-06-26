import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../api';

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

  // const login = async (creds) => {

     // mock delle token
  // if (creds.username === 'demo' && creds.password === '123456') {
  //   const dummyAccess  = 'access';
  //   const dummyRefresh = 'refresh';

  //   // Salvo i token in localStorage
  //   localStorage.setItem('access_token', dummyAccess);
  //   localStorage.setItem('refresh_token', dummyRefresh);

  //   // Aggiorno lo stato React
  //   setUser({ access: dummyAccess });

  //   // Promise risolta → login ok
  //   return;
  // } else {
  //   // Promise rigettata → login fallito
  //   throw new Error('Not valid credentials');
  // }


    const login = async (creds) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({email: creds.username, password: creds.password})
      });

      console.log(res)
      // se lo status non è 2xx
      if (!res.ok) {
        // prova a leggere un messaggio di errore dal body, altrimenti usa default
        const errBody = await res.json().catch(() => null);
        const msg = errBody?.detail || 'Credentials not valid';
        throw new Error(msg);
      }

      // parsing e salvataggio token
      const { access, refresh } = await res.json();
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

      // aggiorna lo stato e fai redirect
      setUser({ access });
      navigate('/home');

    } catch (error) {
      console.error('Login fallito:', error);
      throw error; // o gestiscilo qui, ad es. mostrando un toast
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
