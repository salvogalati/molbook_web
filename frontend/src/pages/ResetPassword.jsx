import React, { useState, useRef, useCallback, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Card } from "primereact/card";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Image } from "primereact/image";
import { Messages } from "primereact/messages";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { API_URL } from "../services/api";
import "./styles/ResetPasswordPage.css";

const variants = {
  hidden: { opacity: 0, x: 40 },
  enter: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

export default function ResetPasswordPage() {
  const { id, token } = useParams();
  const msgs = useRef(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState("form");
  const [touched, setTouched] = useState(false);

  // Memoized match check
  const passwordsMatch = useMemo(
    () => newPassword && newPassword === confirmPassword,
    [newPassword, confirmPassword]
  );

  const handleBlur = useCallback(() => {
    if (!touched) setTouched(true);
  }, [touched]);

  // Reset password API call
  const resetPassword = useCallback(async () => {
    const payload = {
      uid: id,
      token: decodeURIComponent(token.trim()),
      new_password1: newPassword,
      new_password2: confirmPassword,
    };
    try {
      const response = await fetch(
        `${API_URL}/api/auth/password/reset/confirm/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Change password failed");
      }
      setStep("changed");
    } catch (error) {
      if (msgs.current) {
        msgs.current.clear();
        msgs.current.show({
          severity: "error",
          summary: "Error",
          detail: error.message,
          sticky: true,
        });
      }
    }
  }, [id, token, newPassword, confirmPassword]);

  return (
    <div className="rp-container">
      <div className="rp-wrapper">
        <div className="rp-logo">
          <Image
            src="https://molbookpro.farm.unipi.it/wp-content/uploads/2024/09/MB02.png"
            alt="MolBook Logo"
            width={400}
            class="logo-login"
          />
        </div>
        <Card className="rp-card">
          <AnimatePresence mode="wait">
            {step === "form" ? (
              <Motion.div
                key="form"
                variants={variants}
                initial="hidden"
                animate="enter"
                exit="exit"
              >
                <div className="rp-form">
                  <div className="rp-field">
                    <label className="rp-label">New Password</label>
                    <Password
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      toggleMask
                      feedback={false}
                      onBlur={handleBlur}
                      className={touched && !passwordsMatch ? "p-invalid" : ""}
                    />
                  </div>
                  <div className="rp-field">
                    <label className="rp-label">Confirm Password</label>
                    <Password
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      toggleMask
                      feedback={false}
                      onBlur={handleBlur}
                      className={touched && !passwordsMatch ? "p-invalid" : ""}
                    />
                    <Messages ref={msgs} />
                    {touched && confirmPassword && !passwordsMatch && (
                      <small className="p-error">
                        Passwords do not match.
                      </small>
                    )}
                  </div>
                  <div className="rp-action">
                    <Button
                      label="Submit"
                      onClick={resetPassword}
                      disabled={!passwordsMatch}
                    />
                  </div>
                </div>
              </Motion.div>
            ) : (
              <Motion.div
                key="changed"
                variants={variants}
                initial="hidden"
                animate="enter"
                exit="exit"
                className="rp-success"
              >
                <i className="pi pi-check-circle success-icon" />
                <h3>Password changed successfully!</h3>
                <p>
                  Go back to{' '}
                  <Link to="/login" className="rp-link">
                    login
                  </Link>{' '}
                  and access your account.
                </p>
              </Motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </div>
  );
}