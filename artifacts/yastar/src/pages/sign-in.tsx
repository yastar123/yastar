import { useState } from 'react';
import { useLocation } from 'wouter';
import { useOwnerAuth } from '@/lib/ownerAuth';
import { AuthSplitLayout } from '@/components/auth-split-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SignInPage() {
  const { login } = useOwnerAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email.trim(), password);
      setLocation('/user-portal');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthSplitLayout testId="page-sign-in">
      <form
        onSubmit={handleSubmit}
        className="w-[380px] max-w-full flex flex-col gap-5"
        data-testid="form-sign-in"
      >
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-foreground">Selamat datang kembali</h2>
          <p className="text-sm text-muted-foreground">Masuk ke akun Yastar Anda.</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="email@contoh.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            data-testid="input-email"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            data-testid="input-password"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive" data-testid="text-login-error">
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={loading || !email.trim() || !password}
          data-testid="button-sign-in"
        >
          {loading ? 'Memuat…' : 'Masuk'}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Belum punya akun? Hubungi admin untuk mendaftar.
        </p>
      </form>
    </AuthSplitLayout>
  );
}
