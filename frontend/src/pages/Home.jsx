import { useEffect, useState} from "react";
import { getCurrentUser } from "../api";
import { DataScroller } from 'primereact/datascroller';
import { Button } from 'primereact/button';
import { Chart } from 'primereact/chart';
import { Accordion, AccordionTab } from 'primereact/accordion';
import "./styles/Home.css";
import "../components/styles/Loader.css";

/**
 * Home page for the MolBook Pro Web application.
 * Displays a user dashboard with recent projects, storage stats, project analytics, and news.
 */
function Home() {
  // Set a pleasant background when the component is mounted
  useEffect(() => {
    document.body.style.background = "#F0F8FF";
    return () => {
      document.body.style.background = "";
    };
  }, []);

  const [user, setUser] = useState(null);
  // Example: mock data for recent projects
  const [projects] = useState([
    { id: '1000', code: 'f230fh0g3', name: 'My project' },
    { id: '1001', code: 'a230dh0d1', name: 'My project 2' },
    { id: '1002', code: 'b330gh0d2', name: 'My project 3' },
    { id: '1003', code: 'c440hh0d3', name: 'My project 4' },
    { id: '1004', code: 'd550ih0d4', name: 'My project 5' },
    { id: '1005', code: 'e660jh0d5', name: 'My project 6' },
    { id: '1005', code: 'e660jh0d5', name: 'My project 6' },

  ]);
  // Pie chart data: storage usage
  const [pieChartData] = useState({
    labels: ['Available space', 'Used space'],
    datasets: [{ data: [70, 30] }]
  });
  // Bar chart data: project statistics
  const [barChartData] = useState({
    labels: ['In stock', 'Toxicity'],
    datasets: [
      { type: 'bar', label: 'Available', data: [157, 0] },
      { type: 'bar', label: 'Not available', data: [23, 0] },
      { type: 'bar', label: 'Toxic', data: [0, 10] },
      { type: 'bar', label: 'Safety', data: [0, 160] }
    ]
  });

  // Fetch the current user on mount
  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) return;
    getCurrentUser(accessToken)
      .then(setUser)
      .catch(console.error);
  }, []);


  // Render loading state until user is loaded
  if (!user) {
    return (
      <main style={{ padding: '20px' }}>
        <div className="loader" />
        <h1>Loading...</h1>
      </main>
    );
  }

  // Render a single project item in the DataScroller
  const renderProjectItem = (data) => (
    <div className="dashboard-list-row">
      <div className="dashboard-list-info">
        <div className="dashboard-list-title" title={data.name}>
          {data.name}
        </div>
        <div className="dashboard-list-date">
          Last opened 18/08/1995 07:22
        </div>
        <div>
          <Button label="Open" style={{ height: "1.5rem", marginBottom: "0.2rem" }} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="dashboard-root">
      <h3 className="dashboard-title">
        Welcome {user.first_name} to MolBook Pro Web
      </h3>
      <div className="dashboard-grid">
        {/* Recent Projects */}
        <div className="dashboard-section dashboard-projects">
          <DataScroller
            id="recent-projects-datascroller"
            value={projects}
            itemTemplate={renderProjectItem}
            rows={5}
            inline
            scrollHeight="80%"
            header="Recent projects"
          />
        </div>
        {/* Storage Usage */}
        <div className="dashboard-section dashboard-storage">
          <h4 className="dashboard-section-title">Your storage</h4>
          <Chart
            type="doughnut"
            data={pieChartData}
            style={{ height: "70%" }}
            options={{
              maintainAspectRatio: false,
              aspectRatio: 0.8,
              plugins: {
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      const label = context.label || '';
                      const value = context.parsed || 0;
                      return `${label}: ${value} GB`;
                    }
                  }
                }
              }
            }}
          />
        </div>
        {/* Project Statistics */}
        <div className="dashboard-section dashboard-stats">
          <h4 className="dashboard-section-title">Project statistics</h4>
          <Chart
            type="bar"
            data={barChartData}
            style={{ height: "100%", width: "100%" }}
            options={{
              scales: { x: { stacked: true }, y: { stacked: true, grid: { display: false } } },
              maintainAspectRatio: false,
              aspectRatio: 0.8,
              plugins: { legend: { display: false } }
            }}
          />
        </div>
        {/* News & Updates */}
        <div className="dashboard-section dashboard-news">
          <div className="dashboard-news-header">
            <h5>
              News
            </h5>
          </div>
          <Accordion id="newsAccordion" style={{ width: "100%", height: "80%" }} activeIndex={0}>
            <AccordionTab header="MolBook Pro is now available.">
              <p className="m-0" style={{ textAlign: "left" }}>
                We are excited to announce that <strong>MolBook Pro</strong> is officially available!<br />
                Our new platform helps research labs and chemistry professionals manage molecular inventories, optimize workflows, and collaborate more efficiently.<br />
                Discover advanced features, an intuitive interface, and flexible data management built for the scientific community.<br />
                Start exploring MolBook Pro today and take your lab management to the next level!
              </p>
            </AccordionTab>
            <AccordionTab header="Our team is growing">
              <p className="m-0" style={{ textAlign: "left" }}>
                The <strong>MolBook Pro</strong> team is growing!<br /><br />
                We are searching for passionate individuals interested in science and technology.<br /><br />
                If you have experience in chemistry, software development, or scientific data management, and want to join an innovative and dynamic environment—send your CV and a short introduction to <a href="mailto:jobs@molbook.com">jobs@molbook.com</a>.<br /><br />
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
