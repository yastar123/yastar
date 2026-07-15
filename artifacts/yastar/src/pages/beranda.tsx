import { useLocation } from 'wouter';
import {
  Calculator,
  BarChart2,
  TrendingUp,
  Tag,
  Receipt,
  Building2,
  CreditCard,
  Lock,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Account } from '@workspace/api-client-react';
import { TIER_LABELS } from '@/lib/format';

interface ModuleCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  accessKey: keyof NonNullable<Account['moduleAccess']>;
}

const MODULE_CARDS: ModuleCard[] = [
  {
    id: 'target-mundur',
    title: 'Target Profit → Klien',
    description: 'Masukkan target laba, hitung mundur berapa klien yang dibutuhkan dan apakah realistis.',
    icon: <Calculator className="h-5 w-5" />,
    accessKey: 'target_mundur',
  },
  {
    id: 'hpp',
    title: 'Hitung HPP',
    description: 'Hitung Harga Pokok Produksi per unit atau per sesi beserta analisis margin.',
    icon: <BarChart2 className="h-5 w-5" />,
    accessKey: 'hpp',
  },
  {
    id: 'bep-usaha',
    title: 'Titik Impas Usaha',
    description: 'Hitung berapa unit/sesi per bulan yang harus terjual agar usaha tidak merugi.',
    icon: <TrendingUp className="h-5 w-5" />,
    badge: 'Starter+',
    accessKey: 'bep_usaha',
  },
  {
    id: 'harga-jual',
    title: 'Uji Harga Jual & Margin',
    description: 'Hitung harga jual dari target margin/markup, atau periksa margin aktual.',
    icon: <Tag className="h-5 w-5" />,
    badge: 'Starter+',
    accessKey: 'harga_jual',
  },
  {
    id: 'pajak',
    title: 'Estimasi Pajak UMKM',
    description: 'Estimasi PPh Final 0,5% atau PPh Pasal 17 berdasarkan omzet dan biaya bulanan.',
    icon: <Receipt className="h-5 w-5" />,
    badge: 'Starter+',
    accessKey: 'pajak',
  },
  {
    id: 'ekspansi',
    title: 'Kelayakan Cabang Baru',
    description: 'Hitung proyeksi payback period dan ROI sebelum memutuskan buka cabang baru.',
    icon: <Building2 className="h-5 w-5" />,
    badge: 'Pro',
    accessKey: 'ekspansi',
  },
  {
    id: 'pinjaman',
    title: 'Simulasi Pinjaman Modal',
    description: 'Simulasikan cicilan, total bunga, dan dampak pinjaman ke profit usaha.',
    icon: <CreditCard className="h-5 w-5" />,
    badge: 'Pro',
    accessKey: 'pinjaman',
  },
];

interface BerandaPageProps {
  account?: Account;
}

export default function BerandaPage({ account }: BerandaPageProps) {
  const [, navigate] = useLocation();

  function hasAccess(card: ModuleCard): boolean {
    if (!account?.moduleAccess) {
      return card.accessKey === 'target_mundur' || card.accessKey === 'hpp';
    }
    return account.moduleAccess[card.accessKey] === true;
  }

  const scenarioUsage = account
    ? account.scenarioLimit === null
      ? `${account.scenarioCount} skenario tersimpan`
      : `${account.scenarioCount} dari ${account.scenarioLimit} skenario tersimpan`
    : null;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Selamat datang
          {account?.businessName ? `, ${account.businessName}` : ''}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Pilih simulasi bisnis yang ingin kamu jalankan hari ini.
        </p>
      </div>

      {/* Stats strip */}
      {account && (
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5">
            <span className="text-xs text-muted-foreground">Paket</span>
            <Badge variant="outline" className="font-semibold">
              {TIER_LABELS[account.tier]}
            </Badge>
          </div>
          {scenarioUsage && (
            <button
              onClick={() => navigate('/user-portal/skenario')}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 hover:bg-accent transition-colors"
            >
              <Layers className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{scenarioUsage}</span>
              <ArrowRight className="h-3 w-3 text-muted-foreground ml-1" />
            </button>
          )}
        </div>
      )}

      {/* Module grid */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">
          Simulasi Bisnis
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULE_CARDS.map((card) => {
            const accessible = hasAccess(card);
            return (
              <Card
                key={card.id}
                className={`group relative transition-all duration-200 ${
                  accessible
                    ? 'cursor-pointer hover:shadow-md hover:border-primary/40'
                    : 'opacity-60 cursor-not-allowed'
                }`}
                onClick={() => accessible && navigate(`/user-portal/${card.id}`)}
                data-testid={`module-card-${card.id}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className={`p-2 rounded-lg ${
                        accessible ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {accessible ? card.icon : <Lock className="h-5 w-5" />}
                    </div>
                    {card.badge && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {card.badge}
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-sm font-semibold mt-2 leading-snug">
                    {card.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs leading-relaxed">
                    {card.description}
                  </CardDescription>
                  {!accessible && (
                    <p className="text-[11px] text-muted-foreground mt-2 font-medium">
                      Upgrade paket untuk mengakses →
                    </p>
                  )}
                  {accessible && (
                    <div className="mt-3 flex items-center text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      Buka simulasi <ArrowRight className="h-3 w-3 ml-1" />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Upgrade CTA for free users */}
      {account?.tier === 'free' && (
        <div className="rounded-lg border border-border bg-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-sm">Buka lebih banyak simulasi</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Upgrade ke Starter atau Professional untuk akses BEP Usaha, Uji Harga Jual, Pajak UMKM, dan lainnya.
            </p>
          </div>
          <Button size="sm" asChild>
            <a
              href="https://wa.me/?text=Halo%2C%20saya%20ingin%20upgrade%20paket%20Yastar"
              target="_blank"
              rel="noopener noreferrer"
            >
              Hubungi Kami
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}
