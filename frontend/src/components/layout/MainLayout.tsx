import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === '/') {
      navigate('/calls', { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <div className="flex h-screen bg-surface-foreground">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto bg-slate-950/60 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
