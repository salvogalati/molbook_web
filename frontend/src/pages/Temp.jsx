import { useState } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './styles/Temp.css';
import { Card } from "primereact/card";
import { Button } from "primereact/button";

const steps = [
  { id: 1, title: 'Step 1', content: 'Contenuto della prima card' },
  { id: 2, title: 'Step 2', content: 'Contenuto della seconda card' },
  { id: 3, title: 'Step 3', content: 'Contenuto della terza card' },
];

export default function TempPage() {
  const [index, setIndex] = useState(0);

  const next = () => {
    setIndex(prev => Math.min(prev + 1, steps.length - 1));
  };

  const prev = () => {
    setIndex(prev => Math.max(prev - 1, 0));
  };

  return (
    <div style={{
      display: "flex", flex: 1, flexDirection: "row", width: "100%", alignItems: "center",
      justifyContent: "center", backgroundColor: "green",
    }}>
      <Button
        label="Back"
        icon="pi pi-angle-left"
        iconPos="left"
        style={{ width: "10%", marginRight: "1rem" }}
        onClick={prev}
        disabled={index === 0}
      />

<div
  style={{
    width: "30%",
    height: "400px",
    position: "relative", // 👈 fondamentale per gestire l'animazione
    overflow: "hidden",   // 👈 evita scroll o effetti indesiderati
  }}
>
  <TransitionGroup component={null}>
    <CSSTransition
      key={steps[index].id}
      timeout={500}
      classNames="slide"
    >
      <Card
        className="carta"
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          justifyContent: "center",
          boxShadow: "5px 5px 5px 2px lightblue",
          backgroundColor: "rgba(255, 255, 255, 0.6)",
          position: "absolute", // 👈 ora si riferisce al contenitore giusto
          top: 0,
          left: 0,
        }}
      >
        <h2>{steps[index].title}</h2>
        <p>{steps[index].content}</p>
      </Card>
    </CSSTransition>
  </TransitionGroup>
</div>

      <Button
        icon="pi pi-angle-right"
        iconPos="right"
        style={{ width: "10%", marginLeft: "1rem" }}
        onClick={next}
        disabled={index === steps.length - 1}
      />
    </div>
  );
}
