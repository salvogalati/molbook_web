import { useEffect, useState } from "react";
import { getCurrentUser } from "../api"; 
import "./styles/Home.css";

function Home() {
  const [user, setUser] = useState(null);


  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    // const a = getCurrentUser(accessToken);
    // console.log("HELLLOOOO")
    // console.log("CIAO",a)
    if (!accessToken) return;
    getCurrentUser(accessToken)
       .then(userData => {
      setUser(userData);
    })
      .catch(console.error);
  }, []);

  if (!user) {
    return (
      <main style={{ padding: '20px' }}>
        <h1>Loading...</h1>
      </main>
    );
  }



  return (
    <div className="containerMain">
      <h1 style={{marginBottom: 0}}>Welcome {user.first_name} to MolBook Pro Web</h1>
  <div
    className="grid-container"
  >
    <div className="item1">1</div>
    <div className="item2">2</div>
    <div className="item3">3</div>
    <div className="item4">4</div>
    <div className="item5">5</div>
    <div className="item6">6</div>
    <div className="item7">7</div>
    <div className="item8">8</div>
  </div>
    </div>
  );
}

export default Home;
