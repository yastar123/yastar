import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useLogoutAdmin } from '@workspace/api-client-react';
import { AdminLayout } from '@/components/admin-layout';
import AdminOverviewPage from '@/pages/admin-overview';
import AdminAkunPage from '@/pages/admin-akun';
import AdminCmsPage from '@/pages/admin-cms';

export default function AdminDashboardPage({ onSignedOut }: { onSignedOut: () => void }) {
  const [location, setLocation] = useLocation();

  const logout = useLogoutAdmin({
    mutation: {
      onSuccess: () => {
        onSignedOut();
        setLocation('/');
      },
    },
  });

  // Redirect bare /admin → /admin/dashboard
  useEffect(() => {
    if (location === '/admin' || location === '/admin/') {
      setLocation('/admin/dashboard', { replace: true });
    }
  }, [location, setLocation]);

  function renderSection() {
    if (location.startsWith('/admin/akun')) return <AdminAkunPage />;
    if (location.startsWith('/admin/cms')) return <AdminCmsPage />;
    return <AdminOverviewPage />;
  }

  return (
    <AdminLayout onLogout={() => logout.mutate()} data-testid="page-admin-dashboard">
      {renderSection()}
    </AdminLayout>
  );
}
