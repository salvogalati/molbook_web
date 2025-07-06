// import 'primereact/resources/themes/md-light-indigo/theme.css';
// import 'primereact/resources/themes/viva-light/theme.css';
// 2. Lo stile base di PrimeReact
//
// 3. PrimeIcons (necessario per tutte le icone, incluso il filtro)
import "primeflex/primeflex.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primereact/resources/themes/lara-light-indigo/theme.css";
//import "primereact/resources/themes/mira/theme.css"

import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./pages/Home.jsx";
import Contacts from "./pages/Contacts.jsx";
import MoleculeDashboard from "./pages/Molecules.jsx";
import Login from "./pages/Login.jsx";
import MainLayout from "./layouts/MainLayout.jsx";
import { AuthProvider } from "./context/AuthContext";
import SignupPage from "./pages/SignUp.jsx";
import RequireAuth from "./components/RequireAuth";
import TempPage from "./pages/Temp";
import ResetPasswordPage from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/reset-password/:id/:token"
            element={<ResetPasswordPage />}
          />
          <Route path="/verify-email/:key" element={<VerifyEmail />} />
          <Route path="/temp" element={<TempPage />} />

          <Route
            element={
              <RequireAuth>
                <MainLayout />
              </RequireAuth>
            }
          >
            <Route path="/home" element={<Home />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/molecules" element={<MoleculeDashboard />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
