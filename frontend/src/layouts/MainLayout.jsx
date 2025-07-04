// src/layouts/MainLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';

export default function MainLayout() {
  return (
    <>
      {/* Navbar visibile su tutte le pagine “protette” */}
      <Navbar />

      {/* Qui verranno renderizzate le Route figlie */}
      <div style={{marginTop: "30px", paddingBottom: "30px",}}><Outlet /></div>
    </>
  );
}
