import React from 'react';
import { Outlet } from 'react-router-dom';
import OwnerSidebar from './OwnerSidebar';

const OwnerLayout = () => {
  return (
    <div className="owner-layout">
      <OwnerSidebar /> 
      <main className="owner-content">
        <Outlet />
      </main>
    </div>
  );
};

export default OwnerLayout;