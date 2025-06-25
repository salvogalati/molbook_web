import React, { useState } from "react";
import { Steps } from "primereact/steps";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import "primeicons/primeicons.css";
import "./styles/SignUp.css";
import SignUpSteps from "../components/SignUpSteps"
import { CSSTransition, TransitionGroup, SwitchTransition } from 'react-transition-group';
import { Link } from "react-router-dom";

export default function SignupPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState("forward");
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    birth_date: null,
    gender: "Male",
    email: "",
    password: "",
    confirmPassword: "",
    consentPrivacy: false,
  consentTerms: false
  });

  const items = [
    { label: "Info" },
    { label: "Account" },
    { label: "Terms" },
    { label: "Confirm" },
  ];

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

    const today = new Date();
  today.setHours(0,0,0,0);
  const eighteenYearsAgo = new Date(today);
  eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);

    const isAdult = (() => {
    if (!(formData.birth_date instanceof Date)) return false;
    const bd = new Date(formData.birth_date);
    bd.setHours(0,0,0,0);
    return bd <= eighteenYearsAgo;
  })();

    const isStepValid = () => {
    switch (activeIndex) {
      case 0:
        return (
          formData.first_name.trim() !== "" &&
          formData.last_name.trim()  !== "" &&
          isAdult && formData.birth_date       !== null &&
          formData.gender.trim()    !== "" 
        );
      case 1:
        return (
          isValidEmail(formData.email) &&
          formData.password.trim() !== "" &&
          formData.password.trim() === formData.confirmPassword.trim()
      )
      case 2:
        return  (formData.consentPrivacy &&
            formData.consentTerms)
      default:
        return false;
    }
  };

    const next  = () => { setDirection("forward");  setActiveIndex(i=>Math.min(i+1, items.length-1)); };
  const back  = () => { setDirection("backward"); setActiveIndex(i=>Math.max(i-1, 0)); handleChange("confirmPassword", "")};

  /* --->  il trucco: cloneElement su ogni child  <--- */
  const childFactory = child =>
    React.cloneElement(child, {
      classNames: direction === "forward" ? "slide-right" : "slide-left"
    });

  return (
    <div
      style={{
        backgroundImage: `url('https://www.chemicals.co.uk/wp-content/uploads/2021/09/molecules-and-formula-graphic-scaled.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        alignItems: "center",
        justifyContent: "flex-start",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100vh",
      }}
    >

      <div
        className="custom-steps"
        style={{ paddingTop: "1rem", width: "100%" }}
      >
        <Steps model={items} activeIndex={activeIndex} readOnly />

      </div>
      <div style={{
        display: "flex", flex: 1, flexDirection: "row", width: "100%", alignItems: "center",
        justifyContent: "center",
      }}>
        {activeIndex < items.length - 1 && (
        <Button

          label="Back"
          icon="pi pi-angle-left"
          iconPos="left"
          style={{ width: "10%", marginRight: "1rem", }}
          onClick={back}
          disabled={activeIndex===0}
        />
        )}
        <div
  style={{
    width: "50%",
    display: "flex",
    position: "relative",
    overflow: "hidden", 
    height: "400px", 
    justifyContent: "center", 
    alignItems: "center",
  }}>
    <TransitionGroup component={null} childFactory={childFactory}>
    <CSSTransition
      key={`${activeIndex}-${direction}`}
      timeout={500}
      classNames={direction === "forward" ? "slide-right" : "slide-left"}
    >
        <Card
          className="cardSignUp"
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            justifyContent: "center",
            position: "absolute",
            boxShadow: "5px 5px 5px 2px lightblue",
            backgroundColor: "rgba(255, 255, 255, 0.85)",
          }}
        >

          <SignUpSteps activeIndex={activeIndex} formData={formData} onChange={handleChange} />

        </Card>
            </CSSTransition>
  </TransitionGroup>
        </div>
        {activeIndex < items.length - 1 && (
        <Button
          icon="pi pi-angle-right"
          iconPos="right"
          label={activeIndex === items.length - 1 ? "Confirm" : "Next"} 
          //disabled={false} 
          disabled={!isStepValid()}
          style={{ width: "10%", marginLeft: "1rem", }}
          onClick={next}
        />
        )}
      </div>
            <div className="signup-login-prompt" style={{paddingBottom: "1rem"}} >
            <span className="prompt-text">Have you alread an account? </span>
            <Link to="/login" className="prompt-link" style={{fontSize: "1.2rem"}}>
              Sign-in
            </Link>
          </div>
    </div>
  );
}
