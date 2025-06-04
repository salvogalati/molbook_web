import 'primereact/resources/themes/md-light-indigo/theme.css';
// 2. Lo stile base di PrimeReact
import 'primereact/resources/primereact.min.css';
// 3. PrimeIcons (necessario per tutte le icone, incluso il filtro)
import 'primeicons/primeicons.css';
// 4. PrimeFlex (utile per le utility CSS, ma non strettamente obbligatorio per le icone)
import 'primeflex/primeflex.css';


import './App.css';
import Navbar from './Navbar.jsx';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Contacts from './pages/Contacts.jsx';
import MoleculeDashboard from './pages/Molecules.jsx';



function App() {

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/molecules" element={<MoleculeDashboard />} /> 
      </Routes>

    </Router>
  );
}

export default App;

