import { useState } from 'react';
import { useLocation } from 'wouter';
import { ShieldCheck } from 'lucide-react';
import { useLoginAdmin } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminLoginPage({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [password, setPassword] = useState('');
  const [, setLocation] = useLocation();

  const login = useLoginAdmin({
    mutation: {
      onSuccess: () => {
        onAuthenticated();
        setLocation('/admin');
      },
    },
  });

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background px-4" data-testid="page-admin-login">
      <Card className="w-[380px]">
        <CardHeader>
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <CardTitle>Admin Yastar</CardTitle>
          <CardDescription>Masuk dengan kata sandi admin internal.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Kata Sandi</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && password && login.mutate({ data: { password } })}
              data-testid="input-admin-password"
            />
          </div>
          {login.isError && (
            <p className="text-sm text-destructive" data-testid="text-admin-login-error">
              Kata sandi salah. Coba lagi.
            </p>
          )}
          <Button
            onClick={() => login.mutate({ data: { password } })}
            disabled={!password || login.isPending}
            data-testid="button-admin-login"
          >
            {login.isPending ? 'Memeriksa...' : 'Masuk'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
