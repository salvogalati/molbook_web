import { useEffect, useState, useRef } from "react";
import { OrderList } from 'primereact/orderlist';
import { Button } from 'primereact/button';
import "../components/styles/Loader.css";
import "./styles/ProjectManager.css";

/**
 * Home page for the MolBook Pro Web application.
 * Displays a user dashboard with recent projects, storage stats, project analytics, and news.
 */
function ProjectsManager() {
  // Set a pleasant background when the component is mounted
  useEffect(() => {
    document.body.style.background = "#F0F8FF";
    return () => {
      document.body.style.background = "";
    };
  }, []);

  // Example: mock data for recent projects
  const [projects, setProjets] = useState([
    { id: '1000', code: 'f230fh0g3', name: 'My project',  molecules: 8},
    { id: '1001', code: 'a230dh0d1', name: 'My project 2',  molecules: 12 },
    { id: '1002', code: 'b330gh0d2', name: 'My project 3',  molecules: 57 },
    { id: '1003', code: 'c440hh0d3', name: 'My project 4',  molecules: 18 },
    { id: '1004', code: 'd550ih0d4', name: 'My project 5',  molecules: 1863 },
    { id: '1005', code: 'e660jh0d5', name: 'My project 6',  molecules: 2 },
    { id: '1006', code: 'e660jh0d6', name: 'My project 7',  molecules: 245 },

  ]);

  const handleDelete = (id) => {
    console.log(id)
    setProjets((prev) => prev.filter((p) => p.id !== id));
  };



  const itemTemplate = (item) => {
        return (
            <div className="flex flex-wrap p-2 align-items-center gap-3">
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&icon_names=grain" />
                <img className="w-4rem shadow-2 flex-shrink-0 border-round" src={`https://cdn.dribbble.com/userupload/27070181/file/original-42484d59b0ec24a1a2cb433d51b32f0d.png?resize=400x0`} alt={item.name} />
                <div className="flex-1 flex flex-column gap-2 xl:mr-8">
                    <span className="font-bold">{item.name}</span>
                </div>
                <span class="material-symbols-outlined">
                grain
                </span>
                <span className="font-bold text-900">{item.molecules} Molecoles </span>
                <Button rounded text icon="pi pi-trash" onClick={() => handleDelete(item.id)}/>
            </div>
        );
    };
    
    return (
        <div className="card xl:flex">
            <OrderList className="project_list" dataKey="id" value={projects} onChange={(e) => setProjets(e.value)}
            itemTemplate={itemTemplate} header="Projects" filter filterBy="name" filterPlaceholder="Search"
              pt={{
    controls: { style: { display: 'none' } }
  }}></OrderList>
        </div>
    )
}

export default ProjectsManager;
