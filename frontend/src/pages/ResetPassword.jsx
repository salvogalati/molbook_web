import { useState, useRef} from "react";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { useParams } from "react-router-dom";
import { Image } from "primereact/image";
import { Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Messages } from "primereact/messages";
import { API_URL } from '../api';

import "./styles/Login.css";


function ResetPasswordPage() {
    const { id, token } = useParams();
    const msgs = useRef(null);
    const [newPassword, SetNewPassword] = useState("")
    const [newPasswordconfirm, SetNewPasswordConfirm] = useState("")
    const [step, setStep] = useState("form");
    const [touched, setTouched] = useState(false);
    const passwordsMatch = newPassword.length > 0 && newPassword === newPasswordconfirm;

    const handleBlur = () => {
      // segna come “toccato” al primo blur di uno dei due
      if (!touched) {
        setTouched(true);
      }
    };

    const reset_password = async (creds) => {
      const body = JSON.stringify({uid: creds.id, token: creds.token,
               new_password1: creds.newPassword, new_password2: creds.newPasswordconfirm})

          console.log('Request payload:', JSON.stringify(body));
        try {
          const res = await fetch(`${API_URL}/api/auth/password/reset/confirm/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: body
          });
          console.log(res)
          if (!res.ok) {
            const errBody = await res.json().catch(() => null);
            const msg = errBody?.detail || 'Credentials not valid';
            throw new Error(msg);
          }
    
          await res.json();
          setStep("changed")

    
    
        } catch (error) {
          console.error('Change password failed', error);
          if (msgs.current) {
            msgs.current.clear();
            msgs.current.show({
              severity: "error",
              summary: "Error",
              detail: "Change password failed",
              sticky: true,
              closable: false,
            });
        }
      };
    }
    
  const variants = {
    hidden: { opacity: 0, x: 40 },
    enter: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
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
          <AnimatePresence mode="wait">
            {step === "form" && (
              <motion.div
                key="form"
                variants={variants}
                initial="hidden"
                animate="enter"
                exit="exit"
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
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
                    <label>New password</label>
                    <Password
                      onChange={(e) => SetNewPassword(e.target.value)}
                      feedback={false}
                      onBlur={handleBlur}
                      toggleMask
                      style={{ width: "100%", display: "inline" }}
                      inputStyle={{ width: "100%" }}
                      className={touched && !passwordsMatch ? "p-invalid" : ""}
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
                    <label>Confirm new password</label>
                    <Password
                      onChange={(e) => SetNewPasswordConfirm(e.target.value)}
                      feedback={false}
                      onBlur={handleBlur}
                      toggleMask
                      className={touched && !passwordsMatch ? "p-invalid" : ""}
                      style={{ width: "100%", display: "inline" }}
                      inputStyle={{ width: "100%" }}
                    />
                    <Messages ref={msgs} />
                            {touched && newPasswordconfirm !== "" && !passwordsMatch && (
          <small className="p-error">
            Passwords do not match.
          </small>
        )}
                  </div>
                  <div style={{ "padding-top": "3%" }}>
                    <Button
                      label="Submit"
                      style={{ width: "30%", margin: "0 auto" }}
                      onClick={() => reset_password({id, token, newPassword, newPasswordconfirm})}
                      disabled={!passwordsMatch}
                    />
                </div>
                </div>
              </motion.div>
            )}
            {step === "changed" && (
              <motion.div
                key="changed"
                variants={variants}
                initial="hidden"
                animate="enter"
                exit="exit"
              >
           <div
        className="flex flex-column align-items-center p-4"
        style={{ gap: '1rem' }}
      >
        <i
          className="pi pi-check-circle"
          style={{ fontSize: '4rem', color: 'green' }}
        />
        <h3>Password changed successful!</h3>
      <p>
        Go back to{" "}
        <Link to="/login" className="p-link">
          login
        </Link>{" "}
        and access with the new password
      </p>
      </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </div>
  );
}



export default ResetPasswordPage;
