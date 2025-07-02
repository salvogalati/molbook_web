import React, { useState } from 'react';
import MoleculeTable from '../components/MoleculeTable';

const getPubChemImageUrl = name =>
  `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(name)}/PNG?record_type=2d&image_size=300x300`;

export default function Molecules() {
  const [selectedMolecule, setSelectedMolecule] = useState(null);
  const [isHorizontal, setIsHorizontal] = useState(true);

  const toggleLayout = () => setIsHorizontal(prev => !prev);

  // base container
  const containerStyle = {
    position: 'relative',                // per posizionare il pulsante assoluto
    height: 'calc(100vh - 60px)',        // meno navbar
    overflow: 'hidden',
    boxSizing: 'border-box',
    padding: '20px',
  };

  // pulsante in alto a destra
  const buttonStyle = {
    position: 'absolute',
    top: '10px',
    right: '20px',
    // zIndex: 1000
  };

  // stile principale layout
  const pageStyle = {
    display: 'flex',
    flexDirection: isHorizontal ? 'row' : 'column',
    gap: '1rem',
    height: '100%',                       // riempie il container
    marginTop: '10px'             
  };

  // pannello immagine
  const imageStyle = isHorizontal
    ? { flex: '0 0 40%', backgroundColor: "#F5F5F5"}
    : { flex: '0 0 200px' };

  const imageContainerStyle = {
    ...imageStyle,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#fff',
    border: '1px solid #ccc',
    borderRadius: '8px',
    overflow: 'hidden'
  };

  const imgStyle = {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain'
  };

  // pannello tabella
  const tableContainerStyle = {
    flex: isHorizontal ? '1 1 60%' : 1,
    overflowY: 'auto',
    border: '1px solid #ccc',
    borderRadius: '8px',
    
  };

  return (
    <div style={containerStyle}>
      <button style={buttonStyle} onClick={toggleLayout}>
        {isHorizontal ? 'Verticale' : 'Orizzontale'}
      </button>

      <div style={pageStyle}>
        <div style={imageContainerStyle}>
          {selectedMolecule && (
            <img
              src={getPubChemImageUrl(selectedMolecule.name)}
              alt={`Struttura di ${selectedMolecule.name}`}
              style={imgStyle}
              onError={e => (e.currentTarget.src = 'https://www.washingtonpost.com/wp-apps/imrs.php?src=https://arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/LD7WEPSAP7XPVEERGVIKMYX24Q.JPG&w=1800&h=1800')}
            />
          )}
        </div>

        <div style={tableContainerStyle}>
          <MoleculeTable onSelectMolecule={setSelectedMolecule} />
        </div>
      </div>
    </div>
  );
}
