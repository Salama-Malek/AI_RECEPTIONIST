import { Navigate, useRoutes } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import LoginPage from '../pages/LoginPage';
import CallLogPage from '../pages/CallLogPage';
import CallDetailsPage from '../pages/CallDetailsPage';
import SettingsPage from '../pages/SettingsPage';
import LiveMonitorPage from '../pages/LiveMonitorPage';

export default function AppRoutes() {
  return useRoutes([
    { path: '/login', element: <LoginPage /> },
    {
      path: '/',
      element: <MainLayout />,
      children: [
        { index: true, element: <Navigate to="/calls" replace /> },
        { path: 'calls', element: <CallLogPage /> },
        { path: 'calls/:id', element: <CallDetailsPage /> },
        { path: 'settings', element: <SettingsPage /> },
        { path: 'live', element: <LiveMonitorPage /> },
      ],
    },
    { path: '*', element: <Navigate to="/calls" replace /> },
  ]);
}
