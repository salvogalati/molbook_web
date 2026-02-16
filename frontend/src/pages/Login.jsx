import { useState, useRef } from "react";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Messages } from "primereact/messages";
import { useNavigate, Navigate } from "react-router-dom";
import { Image } from "primereact/image";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Message } from "primereact/message";
import { API_URL } from "../services/api";

import "./styles/Login.css";

function Login() {
  const [step, setStep] = useState("login");
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const msgs = useRef(null);
  const navigate = useNavigate();
  const isFormValid = username.trim() !== "" && password.trim() !== "";
  const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);
  const { login, user } = useAuth();

  // useEffect(() => {
  //   console.log(user)
  //   if (user) {
  //     navigate("/home", { replace: true });
  //   }
  // }, [user, navigate]);

  if (user) {
    return <Navigate to="/home" replace />;
  }

  const variants = {
    hidden: { opacity: 0, x: 40 },
    enter: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
  };

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
          detail: err.message || "Credenziali non corrette",
          sticky: true,
          closable: false,
        });
      }
    }
  };

  const handleResend = async (creds) => {
    try {
      const url =
        step === "resend-email"
          ? `${API_URL}/api/auth/registration/resend-email/`
          : `${API_URL}/api/auth/password/reset-pwd/`;

      console.log(url);
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: creds.email }),
      });
      console.log(res);
      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        const msg = errBody?.detail || "Email not valid";
        throw new Error(msg);
      }
      await res.json();
      setSent(true);
    } catch (error) {
      console.error("Send link failed", error);
      if (msgs.current) {
        msgs.current.clear();
        msgs.current.show({
          severity: "error",
          summary: "Error",
          detail: "Send link failed",
          sticky: true,
          closable: false,
        });
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-logo">
          <Image
            className="logo-login"
            alt="Image"
            width="400"
            src="https://molbookpro.farm.unipi.it/wp-content/uploads/2024/09/MB02.png"
          />
        </div>

        <Card
          className="login-card"
          title={
            step === "login"
              ? "Login"
              : step === "resend-password"
                ? "Send reset password link"
                : "Resend Verification email"
          }
        >
          <AnimatePresence mode="wait">
            {step === "login" && (
              <motion.div
                key="login"
                variants={variants}
                initial="hidden"
                animate="enter"
                exit="exit"
              >
                <form
                  className="login-form-container"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                  }}
                >
                  <div className="login-input-container">
                    <label>Username</label>
                    <InputText
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="login-input-container">
                    <label>Password</label>
                    <Password
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      feedback={false}
                      toggleMask
                    />
                  </div>
                  <Button
                    className="p-button-link"
                    onClick={() => setStep("resend-email")}
                  >
                    Resend verification email
                  </Button>
                  <Button
                    className="p-button-link"
                    onClick={() => setStep("resend-password")}
                  >
                    Forgot Password?
                  </Button>
                  <Button
                    type="submit"
                    label="Sign-in"
                    disabled={!isFormValid}
                  />
                </form>
                <Messages ref={msgs} />
                <div className="login-signup-prompt">
                  <span className="prompt-text">Not a member? </span>
                  <Link to="/signup" className="prompt-link">
                    Sign-up
                  </Link>
                </div>
              </motion.div>
            )}
            {(step === "resend-email" || step === "resend-password") && (
              <motion.div
                //key="forgot"
                variants={variants}
                initial="hidden"
                animate="enter"
                exit="exit"
              >
                {sent ? (
                  <Message
                    severity="success"
                    text="If the email was registered you will receive the new link."
                  />
                ) : (
                  <>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                      }}
                    >
                      <InputText
                        //value={email}
                        placeholder="Email address"
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <Button
                        disabled={!isValidEmail(email)}
                        label={
                          step === "resend-password"
                            ? "Send reset link"
                            : "Resend Verifcation email"
                        }
                        onClick={() => {
                          handleResend({ email });
                        }}
                      />
                    </div>
                  </>
                )}

                <Button
                  className="p-button-link"
                  onClick={() => {
                    setStep("login");
                    setSent(false);
                  }}
                >
                  ← Back to login
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </div>
  );
}

export default Login;
