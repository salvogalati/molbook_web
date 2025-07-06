import { ProgressSpinner } from 'primereact/progressspinner';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "primereact/button";
import { Dialog } from 'primereact/dialog';
import Webcam from "react-webcam";
import useIsMobile from "../hooks/useIsMobile";

export default function WebCamDialog({ showWebcamDialog, setShowWebcamDialog, handleAddRow }) {

  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [requestType, setRequestType] = useState("");
  const isMobile = useIsMobile();


  useEffect(() => {
    if (showWebcamDialog) {
      setImgSrc(null);
      setRequestMessage("");
      setRequestType("");
      setLoading(false);
    }
  }, [showWebcamDialog]);

  const capture = async () => {
    if (!webcamRef.current) {
      alert("Webcam non pronta!");
      return;
    }
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      alert("Non riesco a catturare la foto. Riprova!");
      return;
    }
    setImgSrc(imageSrc);
  };

  const handleDialogHide = async () => {
    if (!imgSrc) return; // non inviare se non hai la foto

    setLoading(true);
    setRequestMessage(""); // reset messaggio
    setRequestType("");

    try {
      const res = await fetch(imgSrc);
      const blob = await res.blob();
      const formData = new FormData();
      formData.append("file", new File([blob], "photo.jpg", { type: "image/jpeg" }));

      const response = await fetch("https://heavy-chicken-sit.loca.lt/predict", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (response.ok && data.smiles) {
        handleAddRow({ smiles: data.smiles });
        setRequestType("success");
        setRequestMessage("Molecola aggiunta con successo!");
      } else {
        setRequestType("error");
        setRequestMessage(data.error || "Errore nella predizione.");
      }
    } catch (err) {
      setRequestType("error");
      setRequestMessage("Errore di rete: " + err.message);
    } finally {
      setLoading(false);
      setImgSrc(null);
    }
  };

  return (
    <Dialog
      header="Depict from photo"
      visible={showWebcamDialog}

      style={{ width: "350px" }}
      onHide={() => {
        setShowWebcamDialog(false);
        setRequestMessage("");
        setRequestType("");
      }}
    >
      {!imgSrc && !loading && !requestMessage ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={320}
            //videoConstraints={{ facingMode: "user" }}
            videoConstraints={isMobile ? { facingMode: { exact: "environment" } }: { facingMode: "user" }}
          />
          <Button
            label="Scatta"
            icon="pi pi-camera"
            onClick={capture}
            style={{ marginTop: 15 }}
          />
        </div>
      ) : loading ? (
        <div style={{ textAlign: "center", padding: 20 }}>
          <ProgressSpinner />
          <p>Analisi in corso…</p>
        </div>
      ) : requestMessage ? (
        <div style={{ textAlign: "center" }}>
          <p style={{
            color: requestType === "success" ? "green" : "red",
            fontWeight: "bold"
          }}>
            {requestMessage}
          </p>
          <Button
            label="OK"
            onClick={() => {
              setShowWebcamDialog(false);
              setRequestMessage("");
              setRequestType("");
            }}
            style={{ marginTop: 15 }}
          />
        </div>
      ) : (
        <div style={{ textAlign: "center" }}>
          <img src={imgSrc} alt="foto scattata" style={{ width: "100%", borderRadius: 8 }} />
          <Button
            label="Chiudi"
            icon="pi pi-times"
            onClick={handleDialogHide}
            style={{ marginTop: 15 }}
          />
        </div>
      )}
    </Dialog>

  )
}