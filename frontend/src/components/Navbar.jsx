import { Menubar } from 'primereact/menubar';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { useAuth } from "../context/AuthContext";


function Navbar() {

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
      label: 'Projects',
      icon: 'pi pi-sitemap',
      command: () => navigate('/projects')
    },
    {
      label: 'Molecules',
      icon: 'pi pi-sitemap',
      command: () => navigate('/molecules')
    },
    {
      label: 'Contacts Us',
      icon: 'pi pi-envelope',
      command: () => navigate('/contacts')
    }
  ];

  const handleLogout = async () => {
    await logout();
  }

  return (
    <div className="card">
      <Menubar style={{ height: "3rem" }} model={items} start={start} end={
        <Button
          label="Logout"
          icon="pi pi-sign-out"
          className="p-button-text"
          onClick={handleLogout}
        />}
      />
    </div>
  )
}

export default Navbar;


