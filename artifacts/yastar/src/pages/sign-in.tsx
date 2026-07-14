import { SignIn } from '@clerk/react';
import { AuthSplitLayout } from '@/components/auth-split-layout';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

export default function SignInPage() {
  return (
    <AuthSplitLayout testId="page-sign-in">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </AuthSplitLayout>
  );
}
