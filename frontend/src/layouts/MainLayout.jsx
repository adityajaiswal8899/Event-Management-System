import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { ToastContainer } from '../components/common/ToastContainer';

export const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-dark-600 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ToastContainer />
    </div>
  );
};
