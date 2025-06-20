import { useState, useRef } from "react";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Messages } from "primereact/messages";
import { useNavigate } from "react-router-dom";
import { Image } from "primereact/image";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./styles/Login.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const msgs = useRef(null);
  const navigate = useNavigate();
  const isFormValid = username.trim() !== "" && password.trim() !== "";
  const { login } = useAuth();

  const handleSubmit = async () => {
    try {
      await login({ username, password });
      // qui navighiamo sempre su /home
      navigate("/home", { replace: true });
    } catch (err) {
      console.error(err);
      if (msgs.current) {
        msgs.current.clear();
        msgs.current.show({
          severity: "error",
          summary: "Error",
          detail: "Credenziali non corrette",
          sticky: true,
          closable: false,
        });
      }
    }
  };

  return (
    <div
      style={{
        backgroundImage: `url('https://www.chemicals.co.uk/wp-content/uploads/2021/09/molecules-and-formula-graphic-scaled.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        alignItems: "center",
        justifyContent: "center",
        display: "flex",
        width: "100%",
        height: "100vh",
      }}
    >
      <div className="card" style={{ display: "flex", width: "100%" }}>
        <div
          style={{
            display: "flex",
            width: "40%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            className="logo-login"
            alt="Image"
            width="400"
            src="https://molbookpro.farm.unipi.it/wp-content/uploads/2024/09/MB02.png"
          />
        </div>
        <Card
          className="login-card"
          title="Login"
          style={{
            width: "50%",
            margin: "auto",
            marginLeft: "1%",
            boxShadow: "5px 5px 5px 2px lightblue",
            backgroundColor: "rgba(255, 255, 255, 0.6)",
          }}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                width: "75%",
                margin: "0 auto",
              }}
            >
              <label>Username</label>
              <InputText
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                width: "75%",
                margin: "0 auto",
              }}
            >
              <label>Password</label>
              <Password
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                feedback={false}
                toggleMask
                style={{ width: "100%", display: "inline" }}
                inputStyle={{ width: "100%" }}
              />
            </div>
            <div style={{ "padding-top": "5%" }}>
              <Button
                label="Sign-in"
                style={{ width: "30%", margin: "0 auto" }}
                onClick={handleSubmit}
                disabled={!isFormValid}
              />
            </div>
          </div>
          <Messages ref={msgs} />
          <div className="login-signup-prompt">
            <span className="prompt-text">Not a member? </span>
            <Link to="/signup" className="prompt-link">
              Sign-up
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Login;
