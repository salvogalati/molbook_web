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
      <div style={{
        marginTop: "30px",
        /*height: "calc(100vh - 80px)",*/
        height: "90vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }}>
        <Outlet />
      </div>
    </>
  );
}
