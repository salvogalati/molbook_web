// src/layouts/MainLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar1 } from '../Navbar.jsx';

export default function MainLayout() {
  return (
    <>
      {/* Navbar visibile su tutte le pagine “protette” */}
      <Navbar1 />

      {/* Qui verranno renderizzate le Route figlie */}
      <Outlet />
    </>
  );
}
