import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Steps } from "primereact/steps";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { Link } from "react-router-dom";
import { API_URL } from "../api";

import "primeicons/primeicons.css";
import "./styles/Signup.css"; // Dedicated stylesheet for this page
import SignUpSteps from "../components/SignUpSteps";

// Validation utilities
const emailRegex = /^\S+@\S+\.\S+$/;
const isValidEmail = (email) => emailRegex.test(email);

// Determine if user is at least 18 years old
const eighteenYearsAgo = (() => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setFullYear(date.getFullYear() - 18);
  return date;
})();

export default function SignupPage() {
  // Current step index and slide direction for animation
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState("forward");

  // Form data collected across steps
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: null,
    gender: "Male",
    email: "",
    password: "",
    confirmPassword: "",
    consentPrivacy: false,
    consentTerms: false,
  });

  // Dialog state for server errors
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

  // Steps labels memoized to avoid re-creation
  const stepsModel = useMemo(
    () => [
      { label: "Personal Info" },
      { label: "Account Details" },
      { label: "Agreements" },
      { label: "Confirmation" },
    ],
    []
  );

  // Handle input changes by field name
  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Validate current step
  const isStepValid = useMemo(() => {
    switch (activeIndex) {
      case 0: // Personal info
        if (!formData.first_name.trim() || !formData.last_name.trim()) return false;
        if (!(formData.date_of_birth instanceof Date)) return false;
        // Normalize time and compare
        const dob = new Date(formData.date_of_birth);
        dob.setHours(0, 0, 0, 0);
        if (dob > eighteenYearsAgo) return false;
        return Boolean(formData.gender);

      case 1: // Account details
        return (
          isValidEmail(formData.email) &&
          formData.password.trim() &&
          formData.password === formData.confirmPassword
        );

      case 2: // Agreements
        return formData.consentPrivacy && formData.consentTerms;

      default:
        return false;
    }
  }, [activeIndex, formData]);

  // Proceed to next step
  const next = useCallback(() => {
    setDirection("forward");
    setActiveIndex((i) => Math.min(i + 1, stepsModel.length - 1));
  }, [stepsModel.length]);

  // Go back a step
  const back = useCallback(() => {
    setDirection("backward");
    setActiveIndex((i) => Math.max(i - 1, 0));
    // Clear sensitive data on going back
    setFormData((prev) => ({ ...prev, confirmPassword: "" }));
  }, []);

  // Factory to apply slide animation classes
  const childFactory = useCallback(
    (child) =>
      React.cloneElement(child, {
        classNames: direction === "forward" ? "slide-right" : "slide-left",
      }),
    [direction]
  );

  // Submit registration to API
  const handleSignUp = useCallback(async () => {
    const genderMap = { Male: "M", Female: "F" };
    const payload = {
      ...formData,
      date_of_birth: formData.date_of_birth.toISOString().slice(0, 10),
      gender: genderMap[formData.gender],
    };
    delete payload.consentPrivacy;
    delete payload.consentTerms;

    try {
      const res = await fetch(`${API_URL}/api/auth/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        let msg;
        try {
          const errObj = JSON.parse(text);
          msg = Object.values(errObj).flat().join(" ");
        } catch {
          msg = text || "Registration failed";
        }
        setDialogMessage(msg);
        throw new Error(msg);
      }

      // Move to confirmation step on success
      next();
    } catch (err) {
      console.error("Registration error:", err);
      setDialogVisible(true);
    }
  }, [formData, next]);

  return (
    <div className="signup-container">
      <Steps model={stepsModel} activeIndex={activeIndex} readOnly className="signup-steps" />

      <div className="signup-content">
        {activeIndex !== stepsModel.length - 1 && (
          <Button
          label="Back"
            icon="pi pi-angle-left"
            className="signup-nav-btn back-btn"
            onClick={back}
            disabled={activeIndex === 0}
          />
        )}
        <div className="card-wrapper">
          <TransitionGroup component={null} childFactory={childFactory}>
            <CSSTransition key={activeIndex} timeout={500} unmountOnExit>
              <Card className="signup-card">
                <SignUpSteps
                  activeIndex={activeIndex}
                  formData={formData}
                  onChange={handleChange}
                />
              </Card>
            </CSSTransition>
          </TransitionGroup>

          <Dialog
            visible={dialogVisible}
            header="Registration Error"
            modal
            onHide={() => setDialogVisible(false)}
            className="error-dialog"
          >
            <p>{dialogMessage}</p>
          </Dialog>
        </div>

        {activeIndex < stepsModel.length - 1 && (
          <Button
            icon="pi pi-angle-right"
            className="signup-nav-btn next-btn"
            label={activeIndex === stepsModel.length - 2 ? "Confirm" : "Next"}
            //onClick={activeIndex === stepsModel.length - 2 ? handleSignUp : next}
            onClick={next}
            //disabled={!isStepValid}
          />
        )}
      </div>

      <div className="login-prompt">
        <span>Already have an account? </span>
        <Link to="/login" className="signin-link">
          Sign in
        </Link>
      </div>
    </div>
  );
}
