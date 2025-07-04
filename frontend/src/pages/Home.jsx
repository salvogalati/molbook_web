import { useEffect, useState, useRef } from "react";
import { getCurrentUser } from "../api";
import { DataScroller } from 'primereact/datascroller';
import { Button } from 'primereact/button';
import { Chart } from 'primereact/chart';
import { Accordion, AccordionTab } from 'primereact/accordion';
import "./styles/Home.css";

function Home() {

  useEffect(() => {
    // Cambia background quando si monta
    document.body.style.background = "#F0F8FF";
    // Reset quando si smonta
    return () => {
      document.body.style.background = ""; // Oppure il colore originale
    };
  }, []);

  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([
    { id: '1000', code: 'f230fh0g3', name: 'My project' },
    { id: '1000', code: 'f230fh0g3', name: 'My project' },
    { id: '1000', code: 'f230fh0g3', name: 'My project' },
    { id: '1000', code: 'f230fh0g3', name: 'My project' },
    { id: '1000', code: 'f230fh0g3', name: 'My project' },
    { id: '1000', code: 'f230fh0g3', name: 'My project' },
  ]);
  const [pieChartData, setPieChartData] = useState({
    labels: ['Available space',"Used space"],
    datasets: [{ data: [70, 30,], }
    ]
  });
  const [stackedChartData, setStackedChartData] = useState({
    labels: ['In stock', 'Toxicity',],
    datasets: [{ type: 'bar', label: 'Available', data: [157, 0] },
    { type: 'bar', label: 'Not available', data: [23, 0] },
    { type: 'bar', label: 'Toxic', data: [0, 10] },
    { type: 'bar', label: 'Safety', data: [0, 160] }
    ]
  });

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) return;
    getCurrentUser(accessToken)
      .then(userData => {
        setUser(userData);
      })
      .catch(console.error);
  }, []);

  const dataScrollerRef = useRef(null);

  if (!user) {
    return (
      <main style={{ padding: '20px' }}>
        <h1>Loading...</h1>
      </main>
    );
  }

  const itemTemplate = (data) => {
    return (
      <div className="col-12">
        <div className="flex flex-column xl:flex-row xl:align-items-start p-1 gap-2">
          <div
            className="flex flex-row justify-content-between align-items-center w-full"
            style={{ width: "100%" }}
          >
            <div
              className="text-900"
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flex: "1 1 0"
              }}
            >
              {data.name}
            </div>
            <div
              className="text-700"
              style={{
                minWidth: "170px",
                textAlign: "right",
              }}
            >
              Last open 18/08/1995 07:22
            </div>
            <div>
              <Button label="Open" style={{ height: "1.5rem", marginLeft: "2rem" }} />
            </div>
          </div>
        </div>
      </div>
    );
  };


  return (

    <div className="containerMain">
      <h3 style={{ marginBottom: 0, marginTop: 0 }}>Welcome {user.first_name} to MolBook Pro Web</h3>
      <div
        className="grid-container"
      >
        <div className="item1">
          <DataScroller id="recent-projects-datascroller" value={products} itemTemplate={itemTemplate} rows={5} inline scrollHeight="100%" header="Recent project" />
        </div>
        <div className="item2">
          <h4 style={{margin: "0 0 1.5rem 0"}}> Your storage</h4>
          <Chart type="doughnut" data={pieChartData} style={{ height: "70%" }} options={{
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            plugins: {
              tooltip: {
                callbacks: {
                  // Qui personalizzi la label!
                  label: function (context) {
                    // Recupera il valore
                    const label = context.label || '';
                    const value = context.parsed || 0;
                    return `${label}: ${value} GB`;
                  }
                }
              }
            }
          }} />
        </div>
        <div className="item4">
          <h4 style={{margin: "0 0 1.5rem 0"}}> Project statistics</h4>
          <Chart type="bar" data={stackedChartData} style={{ height: "100%", width: "100%" }}
            options={{
              scales: { x: { stacked: true, }, y: { stacked: true, grid: { display: false } } }, maintainAspectRatio: false,
              aspectRatio: 0.8, plugins: { legend: { display: false } }
            }} />
        </div>
        <div className="item5">
          <div style={{ paddingLeft: "10px", paddingTop: "5px", paddingBottom: "5px", width: "100%" }}>
            <h5 style={{
              margin: 0,
              fontWeight: "bold",
              color: "#193858",
              letterSpacing: "1px",
              textAlign: "left",
              fontSize: "1.15rem"
            }}>
              News
            </h5>
          </div>
          <Accordion id="newAccordion" style={{ width: "100%", height: "80%" }}>
            <AccordionTab header="MolBook Pro is now availble.">
              <p className="m-0" style={{ textAlign: "left" }}>
                We are excited to announce that <strong>MolBook Pro</strong> is officially available to all our users!<br />
                Our brand-new platform was designed to help research labs and chemistry professionals easily manage their molecular inventories, optimize workflows, and collaborate with their teams more efficiently.<br />
                Discover the advanced features, intuitive interface, and flexible data management tools built for the scientific community.<br />
                Start exploring MolBook Pro today and take your lab management to the next level!

              </p>
            </AccordionTab>
            <AccordionTab header="Our team is growing">
              <p className="m-0">
                The <strong>MolBook Pro</strong> team is growing!<br /><br />
                We are searching for passionate individuals who want to make an impact in the world of science and technology.<br /><br />
                If you have experience in chemistry, software development, or scientific data management—and are excited to join an innovative and dynamic environment—please send your CV and a short introduction to <a href="mailto:jobs@molbook.com">jobs@molbook.com</a>.<br /><br />
                Help us build the future of digital chemistry!
              </p>
            </AccordionTab>
          </Accordion>
        </div>




      </div>
    </div>
  );
}

export default Home;
