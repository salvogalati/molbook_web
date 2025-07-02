// import './Navbar.css';
import { Link } from 'react-router-dom';
import { Menubar } from 'primereact/menubar';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { useAuth } from "../context/AuthContext";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">MolBook Pro</div>
      <ul className="navbar-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/molecules">Molecole</Link></li>
        <li>
        <a href="#" className="desktop-item">Dropdown Menu</a>
        <label for="showDrop" className="mobile-item">Dropdown Menu</label>
        <ul className="drop-menu">
          <li><a href="#">Drop menu 1</a></li>
          <li><a href="#">Drop menu 2</a></li>
          <li><a href="#">Drop menu 3</a></li>
          <li><a href="#">Drop menu 4</a></li>
        </ul>
        </li>
        <li><Link to="/contacts">Contatti</Link></li>
      </ul>
    </nav>
  );
}


function Navbar1() {

  const navigate = useNavigate();
  const { logout } = useAuth(); 
  const start = <h2>MolBook Pro</h2>;
  const items = [
    {
      label: 'Home',
      icon: 'pi pi-home',
      command: () => navigate('/home')
    },
    {
      label: 'Molecules',
      icon: 'pi pi-sitemap',
      command: () => navigate('/molecules')
    },
    {
      label: 'Contatti',
      icon: 'pi pi-envelope',
      command: () => navigate('/contacts')
    }
  ];

  const handleLogout = async () => {
    await logout();
  }

    return (
      <div className="card">
          <Menubar style={{height: "3rem"}} model={items} start={start}  end={
        <Button
          label="Logout"
          icon="pi pi-sign-out"
          className="p-button-text"
          onClick={handleLogout}
        /> }
        />
      </div>
    )
}

export default Navbar;
export { Navbar1 };

