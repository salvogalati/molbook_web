import { useState, useEffect } from "react";
import { Card } from "primereact/card";
import { useParams } from "react-router-dom";
import { Image } from "primereact/image";
import { Link } from "react-router-dom";
import { API_URL } from "../api";

import "./styles/Login.css";

function ResetPasswordPage() {
  const { key } = useParams();
  const [step, setStep] = useState("");

  const verify_email = async (creds) => {
    const body = JSON.stringify({
      key: creds.key,

    });

    console.log("Request payload:", JSON.stringify(body));
    try {
      const res = await fetch(`${API_URL}/api/auth/registration/verify-email/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body,
      });
      console.log(res);
      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        const msg = errBody?.detail || "Email not verified";
        throw new Error(msg);
      }

      await res.json();
      setStep("success");

    } catch (error) {
      console.error("Email verification failed", error);
      setStep("failure");
      
    }
  };

    useEffect(() => {
    if (key ) {
      verify_email({ key });
    }
  }, []);

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
          //className="login-card"
          title="Login"
          style={{
            width: "50%",
            margin: "auto",
            marginLeft: "1%",
            boxShadow: "5px 5px 5px 2px lightblue",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
          }}
        >
{step === "failure" && (
            <div
              className="flex flex-column align-items-center p-4"
              style={{ gap: "1rem" }}
            >
              <i
                className="pi pi-times-circle"
                style={{ fontSize: "4rem", color: "green" }}
              />
              <h3>Error during verification email!</h3>
              <p>
                Go back to{" "}
                <Link to="/login" className="p-link">
                  login
                </Link>{" "}
                and request a new verification email
              </p>
            </div>
          )}
          {step === "success" && (
            <div
              className="flex flex-column align-items-center p-4"
              style={{ gap: "1rem" }}
            >
              <i
                className="pi pi-check-circle"
                style={{ fontSize: "4rem", color: "green" }}
              />
              <h3>Email correctly verified!</h3>
              <p>
                Go back to{" "}
                <Link to="/login" className="p-link">
                  login
                </Link>{" "}
                and access with the new password
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
