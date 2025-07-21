import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Sidebar } from '../Layout/Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Sidebar />
      <main className="flex-1 transition-all duration-300">
        {children}
      </main>
      <Footer />
    </div>
  );
};