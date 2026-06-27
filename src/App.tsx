import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppShell } from '@/components/layout/AppShell';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { LoginPage } from '@/components/auth/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { NewProposalPage } from '@/pages/NewProposalPage';
import { ProposalDetailPage } from '@/pages/ProposalDetailPage';
import { EditProposalPage } from '@/pages/EditProposalPage';
import { AdminPage } from '@/pages/AdminPage';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1a1a2e',
            color: '#faf9f6',
            fontSize: '14px',
            borderRadius: '12px',
          },
        }}
      />

      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          element={
            <AuthGuard>
              <AppShell />
            </AuthGuard>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="proposals/new" element={<NewProposalPage />} />
          <Route path="proposals/:id" element={<ProposalDetailPage />} />
          <Route path="proposals/:id/edit" element={<EditProposalPage />} />
          <Route
            path="admin"
            element={
              <AuthGuard requireAdmin>
                <AdminPage />
              </AuthGuard>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}