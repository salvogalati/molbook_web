import React, { useState } from 'react';
import MoleculeTable from '../components/MoleculeTable';

const getPubChemImageUrl = (name) => {
  const encoded = encodeURIComponent(name);
  return `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encoded}/PNG?record_type=2d&image_size=300x300`;
};

const Molecules = () => {
  const [selectedMolecule, setSelectedMolecule] = useState(null);

  return (
    <div style={{ padding: '20px', width: '100%' }}>

      {/* ─── Placeholder / Immagine ───────────────────────────── */}
      <div
        style={{
          width: '200px',
          height: '200px',
          margin: '2rem auto 2rem',
          background: '#fff',        // riquadro bianco
          border: '1px solid #ccc',  // bordo sottile
          borderRadius: '8px',
          overflow: 'hidden',
          position: 'relative',
          textAlign: 'center'
        }}
      >
        {selectedMolecule && (
          <>

            <img
              src={getPubChemImageUrl(selectedMolecule.name)}
              alt={`Struttura di ${selectedMolecule.name}`}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) scale(1.4)',
                transformOrigin: 'center center'
              }}
              onError={e => { e.currentTarget.src = '/images/default.png'; }}
            />
          </>
        )}
      </div>

      {/* ─── Tabella ───────────────────────────────────────────── */}
      <MoleculeTable onSelectMolecule={setSelectedMolecule} />

    </div>
  );
};

export default Molecules;
