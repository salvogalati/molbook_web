import './Navbar.css';
import { Link } from 'react-router-dom';


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

export default Navbar;
