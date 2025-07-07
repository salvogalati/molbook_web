import { ProgressSpinner } from 'primereact/progressspinner';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "primereact/button";
import { Dialog } from 'primereact/dialog';
import Webcam from "react-webcam";
import useIsMobile from "../hooks/useIsMobile";
import { mockPredictFromImage } from "../utils/mockPredictFromImage";
import './styles/WebCamDialog.css';
import './styles/Loader.css'; 

/**
 * A dialog for capturing a photo via webcam and sending it to a prediction service.
 * Displays a spinner while analyzing, and a message (success or error) after prediction.
 */
export default function WebCamDialog({ showWebcamDialog, setShowWebcamDialog, handleAddRow }) {
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [requestType, setRequestType] = useState("");
  //const isMobile = useIsMobile();
  const isMobile = false;
  // Reset state every time the dialog opens
  useEffect(() => {
    if (showWebcamDialog) {
      setImgSrc(null);
      setRequestMessage("");
      setRequestType("");
      setLoading(false);
    }
  }, [showWebcamDialog]);

  // Capture a snapshot from the webcam
  const capture = async () => {
    if (!webcamRef.current) {
      alert("Webcam not ready!");
      return;
    }
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      alert("Failed to capture photo. Try again!");
      return;
    }
    setImgSrc(imageSrc);
  };

  // Submit the image for prediction
  const handleDialogSubmit = async () => {
    if (!imgSrc) return;

    setLoading(true);
    setRequestMessage("");
    setRequestType("");

    try {
      // Convert data URL to blob
      const res = await fetch(imgSrc);
      const blob = await res.blob();
      const formData = new FormData();
      formData.append("file", new File([blob], "photo.jpg", { type: "image/jpeg" }));

      // Send to prediction endpoint
      // const response = await fetch("https://heavy-chicken-sit.loca.lt/predict", {
      //   method: "POST",
      //   body: formData,
      // });
      // const data = await response.json();

      const data = await mockPredictFromImage(imgSrc);
      const response = {ok: true}

      if (response.ok && data.smiles) {
        handleAddRow({ smiles: data.smiles });
        setRequestType("success");
        setRequestMessage("Molecule added successfully!");
      } else {
        setRequestType("error");
        setRequestMessage(data.error || "Prediction error.");
      }
    } catch (err) {
      setRequestType("error");
      setRequestMessage("Network error: " + err.message);
    } finally {
      setLoading(false);
      setImgSrc(null);
    }
  };

  // --- Render ---
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
      {/* Show webcam and capture button */}
      {!imgSrc && !loading && !requestMessage ? (
        <div className="webcam-dialog-content">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={320}
            videoConstraints={isMobile
              ? { facingMode: { exact: "environment" } }
              : { facingMode: "user" }}
          />
          <Button
            label="Capture"
            icon="pi pi-camera"
            onClick={capture}
            className="webcam-capture-btn"
          />
        </div>
      ) : loading ? (
        // Show loading spinner during prediction
        <div className="webcam-dialog-loading">
          <div className="loader" />
          <p>Analyzing…</p>
        </div>
      ) : requestMessage ? (
        // Show prediction result (success or error)
        <div className="webcam-dialog-result">
          <p
            style={{
              color: requestType === "success" ? "green" : "red",
              fontWeight: "bold"
            }}
          >
            {requestMessage}
          </p>
          <Button
            label="OK"
            onClick={() => {
              setShowWebcamDialog(false);
              setRequestMessage("");
              setRequestType("");
            }}
            className="webcam-ok-btn"
          />
        </div>
      ) : (
        // Show preview of captured image, and submit button
        <div className="webcam-dialog-preview">
          <img src={imgSrc} alt="Captured" style={{ width: "100%", borderRadius: 8 }} />
          <Button
            label="Submit"
            icon="pi pi-check"
            onClick={handleDialogSubmit}
            className="webcam-submit-btn"
          />
        </div>
      )}
    </Dialog>
  );
}
