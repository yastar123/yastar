import { Redirect } from 'wouter';

// Sign-up is admin-provisioned; redirect to sign-in.
export default function SignUpPage() {
  return <Redirect to="/sign-in" />;
}
