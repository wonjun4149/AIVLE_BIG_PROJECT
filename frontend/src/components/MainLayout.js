// src/components/MainLayout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const MainLayout = ({ user }) => {
  return (
    <div>
      <Navbar user={user} />
      <main>
        {/* Outlet에 context를 전달하여 자식 컴포넌트에서 user 정보를 사용하도록 합니다. */}
        <Outlet context={{ user }} />
      </main>
    </div>
  );
};

export default MainLayout;
