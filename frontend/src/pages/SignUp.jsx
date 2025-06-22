import React, { useState } from "react";
import { Steps } from "primereact/steps";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import "primeicons/primeicons.css";
import "./styles/SignUp.css";
import SignUpSteps from "../components/SignUpSteps"
import { AnimatePresence, motion } from 'framer-motion';


export default function SignupPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [formData, setFormData] = useState({
    fist_name: "",
    last_name: "",
    birth_date: null,
    gender: "",
  });

  const items = [
    { label: "Info" },
    { label: "Account" },
    { label: "Confirm" },
  ];

    const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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
        style={{ paddingTop: "0.1rem", width: "100%" }}
      >
        <Steps model={items} activeIndex={activeIndex} readOnly />

      </div>
      <div style={{ display: "flex", flex: 1, flexDirection: "row", width: "100%", alignItems: "center",
        justifyContent: "center",
       }}>
              <Button
            label="Back"
            icon="pi pi-angle-left"
            iconPos="left"
            style={{ width: "10%", marginRight: "1rem" }}
            onClick={() => setActiveIndex((prev) => Math.max(prev - 1, 0))}
            disabled={activeIndex === 0}
          />
      <Card
        className="login-card"
        style={{
          display: "flex",
          flexDirection: "column",
          width: "30%",
          justifyContent: "center",
          boxShadow: "5px 5px 5px 2px lightblue",
          backgroundColor: "rgba(255, 255, 255, 0.6)",
        }}
      >
  <AnimatePresence exitBeforeEnter>
    <motion.div
      key={activeIndex}                        // fa re-mount del div ad ogni cambio
      initial={{ opacity: 0, x: 50 }}           // stato iniziale: traslato a destra + trasparente
      animate={{ opacity: 1, x: 0 }}            // stato “in vista”
      exit={{ opacity: 0, x: -50 }}             // animazione di uscita
      transition={{ duration: 0.3 }}            // durata in secondi
      style={{ width: '100%' }}                 // assicurati che il div riempia la card
    >
      <SignUpSteps activeIndex={activeIndex} formData={formData} onChange={handleChange} />
    </motion.div>
  </AnimatePresence>
      </Card>
                <Button
                icon="pi pi-angle-right"
                iconPos="right"
            label={activeIndex === items.length - 1 ? "Confirm" : "Next"} // cambia label all’ultimo step
            style={{ width: "10%", marginLeft: "1rem"}}
            onClick={() =>
              setActiveIndex((prev) => Math.min(prev + 1, items.length - 1))
            }
          />
          </div>
    </div>
  );
}
