import { SignUp } from '@clerk/react';
import { AuthSplitLayout } from '@/components/auth-split-layout';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

export default function SignUpPage() {
  return (
    <AuthSplitLayout testId="page-sign-up">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </AuthSplitLayout>
  );
}
