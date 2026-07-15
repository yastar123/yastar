import { useState } from 'react';
import type { Account } from '@workspace/api-client-react';
import { ArrowLeft, Calculator, TrendingUp, Tag, BarChart2, Building2, CreditCard, Receipt } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CalculatorPage from '@/pages/calculator';
import HppCalculatorPage from '@/pages/hpp-calculator';
import BepUsahaCalculatorPage from '@/pages/bep-usaha-calculator';
import HargaJualCalculatorPage from '@/pages/harga-jual-calculator';
import PajakCalculatorPage from '@/pages/pajak-calculator';
import EkspansiCalculatorPage from '@/pages/ekspansi-calculator';
import PinjamanCalculatorPage from '@/pages/pinjaman-calculator';

interface Module {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  accessKey: keyof NonNullable<Account['moduleAccess']>;
}

const MODULES: Module[] = [
  {
    id: 'target_mundur',
    title: 'Target Profit → Klien',
    description: 'Masukkan target laba, kami hitung mundur berapa klien yang dibutuhkan dan apakah realistis.',
    icon: <Calculator className="h-6 w-6" />,
    accessKey: 'target_mundur',
  },
  {
    id: 'hpp',
    title: 'Hitung HPP',
    description: 'Hitung Harga Pokok Produksi per unit (produk) atau per sesi (jasa) beserta analisis margin.',
    icon: <BarChart2 className="h-6 w-6" />,
    accessKey: 'hpp',
  },
  {
    id: 'bep_usaha',
    title: 'Titik Impas Usaha (BEP)',
    description: 'Hitung berapa unit/sesi per bulan yang harus terjual agar usaha tidak merugi.',
    icon: <TrendingUp className="h-6 w-6" />,
    accessKey: 'bep_usaha',
    badge: 'Starter+',
  },
  {
    id: 'harga_jual',
    title: 'Uji Harga Jual & Margin',
    description: 'Hitung harga jual dari target margin/markup, atau periksa margin aktual dari harga yang ada.',
    icon: <Tag className="h-6 w-6" />,
    accessKey: 'harga_jual',
    badge: 'Starter+',
  },
  {
    id: 'pajak',
    title: 'Estimasi Pajak UMKM',
    description: 'Estimasi PPh Final 0,5% atau PPh Pasal 17 berdasarkan omzet dan biaya bulanan.',
    icon: <Receipt className="h-6 w-6" />,
    accessKey: 'pajak',
    badge: 'Starter+',
  },
  {
    id: 'ekspansi',
    title: 'Kelayakan Cabang Baru',
    description: 'Hitung proyeksi payback period dan ROI sebelum memutuskan membuka cabang baru.',
    icon: <Building2 className="h-6 w-6" />,
    accessKey: 'ekspansi',
    badge: 'Pro',
  },
  {
    id: 'pinjaman',
    title: 'Simulasi Pinjaman Modal',
    description: 'Simulasikan cicilan, total bunga, dan dampak pinjaman ke profit usaha (flat atau anuitas).',
    icon: <CreditCard className="h-6 w-6" />,
    accessKey: 'pinjaman',
    badge: 'Pro',
  },
];

interface SimulationHubPageProps {
  canSave: boolean;
  account?: Account;
  onScenarioSaved: () => void;
}

export default function SimulationHubPage({ canSave, account, onScenarioSaved }: SimulationHubPageProps) {
  const [activeModule, setActiveModule] = useState<string | null>(null);

  function hasAccess(mod: Module): boolean {
    if (!account?.moduleAccess) return mod.accessKey === 'target_mundur' || mod.accessKey === 'hpp';
    return account.moduleAccess[mod.accessKey] === true;
  }

  if (activeModule) {
    return (
      <div>
        <button
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          onClick={() => setActiveModule(null)}
          data-testid="button-back-to-hub"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Simulasi Bisnis
        </button>
        {activeModule === 'target_mundur' && (
          <CalculatorPage canSave={canSave} onScenarioSaved={onScenarioSaved} />
        )}
        {activeModule === 'hpp' && (
          <HppCalculatorPage canSave={canSave} onScenarioSaved={onScenarioSaved} />
        )}
        {activeModule === 'bep_usaha' && (
          <BepUsahaCalculatorPage canSave={canSave} onScenarioSaved={onScenarioSaved} />
        )}
        {activeModule === 'harga_jual' && (
          <HargaJualCalculatorPage canSave={canSave} onScenarioSaved={onScenarioSaved} />
        )}
        {activeModule === 'pajak' && (
          <PajakCalculatorPage canSave={canSave} onScenarioSaved={onScenarioSaved} />
        )}
        {activeModule === 'ekspansi' && (
          <EkspansiCalculatorPage canSave={canSave} onScenarioSaved={onScenarioSaved} />
        )}
        {activeModule === 'pinjaman' && (
          <PinjamanCalculatorPage canSave={canSave} onScenarioSaved={onScenarioSaved} />
        )}
      </div>
    );
  }

  return (
    <div data-testid="page-simulation-hub">
      <div className="mb-6">
        <h2 className="text-xl font-bold">Simulasi Bisnis</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Pilih modul simulasi yang ingin kamu jalankan. Semua perhitungan bersifat sementara — simpan hasilnya sebagai skenario untuk dibandingkan nanti.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MODULES.map((mod) => {
          const accessible = hasAccess(mod);
          return (
            <Card
              key={mod.id}
              className={`transition-all ${
                accessible
                  ? 'cursor-pointer hover:border-primary/50 hover:shadow-sm'
                  : 'opacity-50 cursor-not-allowed'
              }`}
              onClick={() => accessible && setActiveModule(mod.id)}
              data-testid={`card-module-${mod.id}`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {mod.icon}
                  </div>
                  {mod.badge && (
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {mod.badge}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-base mt-2">{mod.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {mod.description}
                </CardDescription>
                {!accessible && (
                  <p className="text-xs text-muted-foreground mt-2 font-medium">
                    🔒 Upgrade paket untuk mengakses
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
