import React, { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { Fieldset } from "primereact/fieldset";
import { Message } from "primereact/message";
import { Button } from "primereact/button";
import { Tooltip } from "primereact/tooltip";
import "./styles/Loader.css";

export default function AddMoleculeDialog({
  showDialog,
  setShowDialog,
  columns,
  onSave,
}) {
  const [isLoadingSketcher, setIsLoadingSketcher] = useState(true);
  const [fields, setFields] = useState([]);
  const [showSketcher, setShowSketcher] = useState(false);
  const iframeRef = useRef(null);
  const [newColumnName, setNewColumnName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (showDialog) {
      setIsLoadingSketcher(true);
    }
  }, [showDialog]);

  useEffect(() => {
    setSubmitted(false);
    if (showDialog && Array.isArray(columns)) {
      setFields(
        columns.map((col) => ({
          id: col.field,
          label: col.header,
          value: "",
        }))
      );
    }
  }, [showDialog, columns]);

  const handleAddField = () => {
    const nextId = `new-${fields.length + 1}`;
    setFields((prev) => [
      ...prev,
      { id: nextId, label: newColumnName, value: "" },
    ]);
    setNewColumnName("");
  };

  const handleFieldChange = (id, newValue) => {
    //console.log(id, newValue)
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, value: newValue } : f))
    );
  };

  const handleRemoveField = (idToRemove) => {
    setFields((prev) => prev.filter((f) => f.id !== idToRemove));
  };

  const handleDialogHide = async () => {
    // Proviamo a recuperare il smile dallo sketcher
    try {
      const ketcher = iframeRef.current?.contentWindow?.ketcher;
      if (ketcher && typeof ketcher.getSmiles === "function") {
        const smiles = await ketcher.getSmiles();
        handleFieldChange("Image", smiles);
        console.log("SMILES disegnato:", smiles);
      } else {
        console.warn("Ketcher non è ancora pronto o API non disponibile");
      }
    } catch (err) {
      console.error("Errore nel recupero dello SMILES:", err);
    }
    setShowSketcher(false);
  };

  const handleSketcherLoad = () => {
    setIsLoadingSketcher(false);
    setTimeout(() => {
      const ketcher = iframeRef.current?.contentWindow?.ketcher;
      const field = fields.find((f) => f.id === "Image");
      const smilesToLoad = field?.value || "";
      ketcher.setMolecule(smilesToLoad);
    }, 1000);
  };

  const handleSave = () => {
    setSubmitted(true);
    if (!isFormValid) return;
    onSave(fields);
    setShowDialog(false);
  };

  const codeValue = fields.find((f) => f.id === "code")?.value.trim() || "";
  const smilesValue = fields.find((f) => f.id === "Image")?.value.trim() || "";
  const isFormValid = codeValue !== "" && smilesValue !== "";

  const footerContent = (
    <div>
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={() => setShowDialog(false)}
        className="p-button-text"
      />
      <span className={"save-tooltip"}>
        <Button
          label="Save"
          icon="pi pi-check"
          onClick={handleSave}
          disabled={!isFormValid}
          style={{ pointerEvents: isFormValid ? "auto" : "none" }}
          tooltip={!isFormValid ? "Fill the required fields" : null}
          tooltipOptions={{ showOnDisabled: true }}
        />
      </span>
      <Tooltip selector=".save-tooltip" />
    </div>
  );

  return (
    <Dialog
      visible={showDialog}
      style={{ height: "80%", width: "50vw" }}
      header="Add new molecule"
      onHide={() => {
        setShowDialog(false);
      }}
      footer={footerContent}
      breakpoints={{
        "1024px": "70vw",
        "768px": "90vw",
        "480px": "100vw",
      }}
    >
      <div
        style={{
          width: "100%",
          paddingTop: "2rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          overflow: "auto",
          gap: "2rem",
          justifyContent: "center",
        }}
      >
        {fields.map(({ id, label, value }) => {
          const isRequired = id === "code" || id === "Image";
          const showError = isRequired && !value.trim();

          return (
            <div>
              <div
                style={{
                  display: "flex",
                  flex: "wrap",
                  width: "100%",
                  justifyContent: "center",
                  gap: "1rem",
                }}
              >
                <FloatLabel key={id === "Image" ? "SMILES" : id}>
                  <InputText
                    id={id === "Image" ? "SMILES" : id}
                    value={value}
                    onChange={(e) => handleFieldChange(id, e.target.value)}
                  />
                  <label htmlFor={id}>
                    {label === "Image" ? "SMILES" : label}
                  </label>
                </FloatLabel>
                {label === "Image" ? (
                  <div>
                    <Button
                      icon="pi pi-pencil"
                      onClick={() => {
                        setShowSketcher(true);
                      }}
                    />
                  </div>
                ) : id.startsWith("new-") ? (
                  <div>
                    <Button
                      icon="pi pi-trash"
                      severity="danger"
                      onClick={() => handleRemoveField(id)}
                    />
                  </div>
                ) : (
                  <div style={{ width: "3rem" }}></div>
                )}
              </div>
              {showError && (
                <Message
                  severity="error"
                  text={`Field is required`}
                  style={{ padding: 0, marginTop: "0.5rem" }}
                />
              )}
            </div>
          );
        })}

        <Fieldset legend="Add new column">
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "columns",
              gap: "2rem",
            }}
          >
            <InputText
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              style={{ width: "100%" }}
            ></InputText>
            <Button
              icon="pi pi-plus"
              onClick={handleAddField}
              disabled={!newColumnName}
            />
          </div>
        </Fieldset>
      </div>
      <Dialog
        visible={showSketcher}
        style={{ height: "100%", width: "100%" }}
        headerStyle={{ padding: 0 }}
        onHide={handleDialogHide}
      >
        {isLoadingSketcher && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255,255,255,0.8)",
              zIndex: 10,
            }}
          >
            <div className="loader" />
            <p>Loading sketcher…</p>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src="../../ketcher/index.html"
          title="Ketcher Sketcher"
          style={{
            width: "100%",
            height: "100%",
            border: "none",
          }}
          allowFullScreen
          onLoad={() => handleSketcherLoad()}
        />
      </Dialog>
    </Dialog>
  );
}
