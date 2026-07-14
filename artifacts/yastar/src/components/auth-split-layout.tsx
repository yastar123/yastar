import type { ReactNode } from 'react';
import { Compass, Sparkles, TrendingUp } from 'lucide-react';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

interface AuthSplitLayoutProps {
  children: ReactNode;
  testId: string;
}

/**
 * Shared split-screen shell for the sign-in / sign-up pages: a branded
 * panel on the left (hidden on small screens) and the Clerk form on the
 * right.
 */
export function AuthSplitLayout({ children, testId }: AuthSplitLayoutProps) {
  return (
    <div className="grid min-h-[100dvh] lg:grid-cols-2" data-testid={testId}>
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-[hsl(160,50%,14%)] px-12 py-12 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 20%, hsl(160 45% 30%) 0%, transparent 45%), radial-gradient(circle at 85% 80%, hsl(160 45% 25%) 0%, transparent 50%)',
          }}
        />
        <a href={basePath || '/'} className="relative z-10 flex items-center gap-2">
          <img src={`${basePath}/logo.svg`} alt="Yastar" className="h-9 w-9 rounded-xl" />
          <span className="text-lg font-bold tracking-tight">Yastar</span>
        </a>

        <div className="relative z-10 flex flex-col gap-6 max-w-md">
          <h1 className="text-3xl xl:text-4xl font-bold leading-[1.15] tracking-tight">
            Mulai dari laba yang kamu mau, temukan jalannya.
          </h1>
          <p className="text-white/70 text-base leading-relaxed">
            Yastar membalik arah kalkulator bisnis: tentukan target laba usahamu, kami hitung
            berapa klien yang dibutuhkan untuk mencapainya.
          </p>
          <div className="flex flex-col gap-4 pt-2">
            <Feature icon={Compass} text="Kalkulator target terbalik untuk salon, barbershop, nail studio, dan spa" />
            <Feature icon={Sparkles} text="Insight otomatis yang menandai risiko sebelum jadi masalah" />
            <Feature icon={TrendingUp} text="Simpan dan bandingkan skenario pertumbuhan bisnismu" />
          </div>
        </div>

        <p className="relative z-10 text-sm text-white/50">
          © {new Date().getFullYear()} Yastar. Semua hak dilindungi.
        </p>
      </div>

      <div className="flex items-center justify-center bg-background px-4 py-12">
        <div className="w-full flex flex-col items-center gap-6">
          <a href={basePath || '/'} className="flex lg:hidden items-center gap-2">
            <img src={`${basePath}/logo.svg`} alt="Yastar" className="h-9 w-9 rounded-xl" />
            <span className="text-lg font-bold tracking-tight">Yastar</span>
          </a>
          {children}
        </div>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, text }: { icon: typeof Compass; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-sm text-white/80 leading-relaxed">{text}</p>
    </div>
  );
}
