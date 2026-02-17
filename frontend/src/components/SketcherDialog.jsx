import { useState } from "react";
import { Dialog } from "primereact/dialog";

export default function SketcherDialog({
  visible,
  smilesToLoad,
  onSmilesChange,
  iframeRef
}) {
    const [isLoading, setIsLoading] = useState(true);
    const handleDialogHide = async () => {
    try {
      const ketcher = iframeRef.current?.contentWindow?.ketcher;

      if (ketcher && typeof ketcher.getSmiles === "function") {
        const smiles = await ketcher.getSmiles();
        //console.log("SMILES disegnato:", smiles);

        if (onSmilesChange && smiles != "" && smiles != onSmilesChange) {
          onSmilesChange(smiles); // passa il dato al parent
        }
      } else {
        console.warn("Ketcher non è ancora pronto o API non disponibile");
      }
    } catch (err) {
      console.error("Errore nel recupero dello SMILES:", err);
    }

    //onHide(); // chiude il dialog
  };

const handleSketcherLoad = () => {
    setTimeout(() => {

      const ketcher = iframeRef.current?.contentWindow?.ketcher;
      ketcher.setMolecule(smilesToLoad);
      setIsLoading(false); 
    }, 1000);
  };

  return (
    <Dialog
      visible={visible}
      style={{ height: "100%", width: "100%" }}
      headerStyle={{ padding: 0 }}
      onHide={handleDialogHide}
    >
      {isLoading && (
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
        src={`${import.meta.env.BASE_URL}ketcher/index.html`}
        title="Ketcher Sketcher"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
        }}
        allowFullScreen
        onLoad={handleSketcherLoad}
      />
    </Dialog>
  );
}
