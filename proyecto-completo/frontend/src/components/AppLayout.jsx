import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Sidebar, { MobileMenuButton } from './Sidebar';
import ChatWidget from './ChatWidget';
import { getToken } from '../utils/auth';

function getUserEmail() {
  const token = getToken();
  if (!token) return '';
  try {
    const decoded = jwtDecode(token);
    return decoded.email || '';
  } catch {
    return '';
  }
}

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const userEmail = getUserEmail();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="lg:pl-72">
        <main className="mx-auto max-w-7xl px-5 py-5 sm:px-8 lg:px-10">
          <div className="mb-5 lg:hidden">
            <MobileMenuButton onClick={() => setMenuOpen(true)} />
          </div>
          <Outlet context={{ userEmail }} />
        </main>
      </div>
      <ChatWidget />
    </div>
  );
}
