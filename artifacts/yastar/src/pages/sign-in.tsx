import { SignIn } from '@clerk/react';
import { AuthSplitLayout } from '@/components/auth-split-layout';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

export default function SignInPage() {
  return (
    <AuthSplitLayout testId="page-sign-in">
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        appearance={{
          elements: {
            // Hide the "Don't have an account?" footer — accounts are admin-provisioned
            footerAction: 'hidden',
            footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
          },
        }}
      />
    </AuthSplitLayout>
  );
}
