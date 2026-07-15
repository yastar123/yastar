import { useEffect, useRef } from 'react';
import { ClerkProvider, Show, useClerk } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { Redirect, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { useGetAdminSession } from '@workspace/api-client-react';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { queryClient } from '@/lib/queryClient';
import HomePage from '@/pages/home';
import SignInPage from '@/pages/sign-in';
import UserPortalPage from '@/pages/user-portal';
import AdminLoginPage from '@/pages/admin-login';
import AdminDashboardPage from '@/pages/admin-dashboard';
import NotFound from '@/pages/not-found';

// REQUIRED — copy verbatim. Resolves the key from window.location.hostname so the
// same build serves multiple Clerk custom domains. Do not inline the env var, leave
// publishableKey undefined, or replace publishableKeyFromHost with anything else.
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

// REQUIRED — copy verbatim. Empty in dev (Clerk hits dev FAPI directly), auto-set
// in prod. Do NOT gate on import.meta.env.PROD / NODE_ENV — the empty dev value
// is intentional, and any branching breaks the prod proxy.
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

// Clerk passes full paths to routerPush/routerReplace, but wouter's
// setLocation prepends the base — strip it to avoid doubling.
function stripBase(path: string): string {
  return basePath && path.startsWith(basePath) ? path.slice(basePath.length) || '/' : path;
}

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env file');
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: 'clerk',
  options: {
    logoPlacement: 'inside' as const,
    logoLinkUrl: basePath || '/',
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: 'hsl(160 50% 20%)',
    colorForeground: 'hsl(160 50% 15%)',
    colorMutedForeground: 'hsl(160 20% 40%)',
    colorDanger: 'hsl(0 70% 50%)',
    colorBackground: 'hsl(0 0% 100%)',
    colorInput: 'hsl(140 10% 96%)',
    colorInputForeground: 'hsl(160 50% 15%)',
    colorNeutral: 'hsl(140 10% 90%)',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    borderRadius: '0.75rem',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox: 'bg-white rounded-2xl w-[440px] max-w-full overflow-hidden shadow-lg',
    card: '!shadow-none !border-0 !bg-transparent !rounded-none',
    footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
    headerTitle: 'text-[hsl(160,50%,15%)] font-bold',
    headerSubtitle: 'text-[hsl(160,20%,40%)]',
    socialButtonsBlockButtonText: 'text-[hsl(160,50%,15%)] font-medium',
    formFieldLabel: 'text-[hsl(160,50%,15%)]',
    footerActionLink: 'text-[hsl(160,50%,20%)] font-semibold',
    footerActionText: 'text-[hsl(160,20%,40%)]',
    dividerText: 'text-[hsl(160,20%,40%)]',
    identityPreviewEditButton: 'text-[hsl(160,50%,20%)]',
    formFieldSuccessText: 'text-[hsl(160,50%,20%)]',
    alertText: 'text-[hsl(0,70%,40%)]',
    logoBox: 'flex justify-center py-2',
    logoImage: 'h-10 w-10 rounded-xl',
    socialButtonsBlockButton: 'border border-[hsl(140,10%,88%)] hover:bg-[hsl(140,10%,96%)]',
    formButtonPrimary: 'bg-[hsl(160,50%,20%)] hover:bg-[hsl(160,50%,15%)] text-white',
    formFieldInput: 'border border-[hsl(140,10%,88%)] bg-white text-[hsl(160,50%,15%)]',
    footerAction: 'bg-transparent',
    dividerLine: 'bg-[hsl(140,10%,88%)]',
    alert: 'bg-[hsl(0,70%,97%)] border border-[hsl(0,70%,90%)]',
    otpCodeFieldInput: 'border border-[hsl(140,10%,88%)]',
    formFieldRow: '',
    main: '',
  },
};

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/user-portal" />
      </Show>
      <Show when="signed-out">
        <HomePage />
      </Show>
    </>
  );
}

function UserPortalRoute() {
  return (
    <>
      <Show when="signed-in">
        <UserPortalPage />
      </Show>
      <Show when="signed-out">
        <Redirect to="/" />
      </Show>
    </>
  );
}

function AdminGate() {
  const { data: session, isLoading, refetch } = useGetAdminSession();

  if (isLoading) return null;

  if (!session?.authenticated) {
    return <AdminLoginPage onAuthenticated={() => refetch()} />;
  }

  return <AdminDashboardPage onSignedOut={() => refetch()} />;
}

// Helps user's webview stay up-to-date when the signed-in user changes by invalidating the QueryClient cache.
function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      localization={{
        signIn: {
          start: {
            title: 'Selamat datang kembali',
            subtitle: 'Masuk untuk mengakses kalkulatormu',
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <Switch>
          <Route path="/" component={HomeRedirect} />
          <Route path="/sign-in/*?" component={SignInPage} />
          <Route path="/sign-up/*?"><Redirect to="/sign-in" /></Route>
          <Route path="/user-portal" component={UserPortalRoute} />
          <Route path="/admin" component={AdminGate} />
          <Route component={NotFound} />
        </Switch>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <TooltipProvider>
      <WouterRouter base={basePath}>
        <ClerkProviderWithRoutes />
      </WouterRouter>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
