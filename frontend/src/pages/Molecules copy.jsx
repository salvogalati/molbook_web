// src/pages/Molecules.jsx
import React, { useState } from 'react';
import MoleculeTable from '../components/MoleculeTable';

const getPubChemImageUrl = (name) => {
  const encoded = encodeURIComponent(name);
  return `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encoded}/PNG?record_type=2d&image_size=300x300`;
};

const Molecules = () => {
  const [selectedMolecule, setSelectedMolecule] = useState(null);

  return (
    <div
      style={{
        display: 'flex',                                 // ①
        gap: '1rem',
        height: 'calc(100vh - 60px)',                     // ②
        padding: '20px',
        boxSizing: 'border-box'
      }}
    >
      {/* ─── Pannello Immagine ───────────────────────────── */}
      <div
        style={{
          flex: '0 0 40%',                                 // ③
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#fff',
          border: '1px solid #ccc',
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      >
        {selectedMolecule && (
          <img
            src={getPubChemImageUrl(selectedMolecule.name)}
            alt={`Struttura di ${selectedMolecule.name}`}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain'
            }}
            onError={(e) => { e.currentTarget.src = '/images/default.png'; }}
          />
        )}
      </div>

      {/* ─── Pannello Tabella ───────────────────────────── */}
      <div
        style={{
          flex: '1 1 60%',                                  // ④
          overflowY: 'auto'
        }}
      >
        <MoleculeTable onSelectMolecule={setSelectedMolecule} />
      </div>
    </div>
  );
};

export default Molecules;
