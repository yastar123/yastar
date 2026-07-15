import { useEffect, useRef } from 'react';
import { Redirect, Route, Switch, Router as WouterRouter } from 'wouter';
import { QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { queryClient } from '@/lib/queryClient';
import { OwnerAuthProvider, useOwnerAuth } from '@/lib/ownerAuth';
import HomePage from '@/pages/home';
import SignInPage from '@/pages/sign-in';
import UserPortalPage from '@/pages/user-portal';
import AdminLoginPage from '@/pages/admin-login';
import AdminDashboardPage from '@/pages/admin-dashboard';
import NotFound from '@/pages/not-found';
import { useGetAdminSession } from '@workspace/api-client-react';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

function HomeRedirect() {
  const { session, isLoading } = useOwnerAuth();
  if (isLoading) return null;
  if (session?.authenticated) return <Redirect to="/user-portal" />;
  return <HomePage />;
}

function UserPortalRoute() {
  const { session, isLoading } = useOwnerAuth();
  if (isLoading) return null;
  if (!session?.authenticated) return <Redirect to="/" />;
  return <UserPortalPage />;
}

function AdminGate() {
  const { data: adminSession, isLoading, refetch } = useGetAdminSession();
  if (isLoading) return null;
  if (!adminSession?.authenticated) {
    return <AdminLoginPage onAuthenticated={() => refetch()} />;
  }
  return <AdminDashboardPage onSignedOut={() => refetch()} />;
}

// Invalidate TanStack Query cache when owner session changes.
function OwnerSessionCacheInvalidator() {
  const { session } = useOwnerAuth();
  const qc = useQueryClient();
  const prevIdRef = useRef<number | null | undefined>(undefined);

  useEffect(() => {
    const currentId = session?.accountId ?? null;
    if (prevIdRef.current !== undefined && prevIdRef.current !== currentId) {
      qc.clear();
    }
    prevIdRef.current = currentId;
  }, [session?.accountId, qc]);

  return null;
}

function AppRoutes() {
  return (
    <QueryClientProvider client={queryClient}>
      <OwnerSessionCacheInvalidator />
      <Switch>
        <Route path="/" component={HomeRedirect} />
        <Route path="/sign-in" component={SignInPage} />
        <Route path="/sign-up"><Redirect to="/sign-in" /></Route>
        <Route path="/user-portal" component={UserPortalRoute} />
        <Route path="/admin" component={AdminGate} />
        <Route component={NotFound} />
      </Switch>
    </QueryClientProvider>
  );
}

function App() {
  return (
    <TooltipProvider>
      <WouterRouter base={basePath}>
        <OwnerAuthProvider>
          <AppRoutes />
        </OwnerAuthProvider>
      </WouterRouter>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
