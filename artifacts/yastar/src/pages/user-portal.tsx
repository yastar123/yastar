import { Redirect, useParams } from 'wouter';
import { useGetMyAccount } from '@workspace/api-client-react';
import { useOwnerAuth } from '@/lib/ownerAuth';
import { useQueryClient } from '@tanstack/react-query';
import PortalLayout from '@/components/portal-layout';

// Calculator pages
import BerandaPage from '@/pages/beranda';
import CalculatorPage from '@/pages/calculator';
import HppCalculatorPage from '@/pages/hpp-calculator';
import BepUsahaCalculatorPage from '@/pages/bep-usaha-calculator';
import HargaJualCalculatorPage from '@/pages/harga-jual-calculator';
import PajakCalculatorPage from '@/pages/pajak-calculator';
import EkspansiCalculatorPage from '@/pages/ekspansi-calculator';
import PinjamanCalculatorPage from '@/pages/pinjaman-calculator';
import ScenariosPage from '@/pages/scenarios';

const VALID_MODULES = new Set([
  'beranda',
  'target-mundur',
  'hpp',
  'bep-usaha',
  'harga-jual',
  'pajak',
  'ekspansi',
  'pinjaman',
  'skenario',
]);

export default function UserPortalPage() {
  const { session } = useOwnerAuth();
  const params = useParams<{ module?: string }>();
  const module = params.module ?? 'beranda';
  const qc = useQueryClient();

  const { data: account, refetch } = useGetMyAccount();

  if (!session?.authenticated) return <Redirect to="/" />;

  // Default: redirect to beranda
  if (!params.module) return <Redirect to="/user-portal/beranda" />;

  // Unknown module → beranda
  if (!VALID_MODULES.has(module)) return <Redirect to="/user-portal/beranda" />;

  const canSave = account
    ? account.scenarioLimit === null || account.scenarioCount < account.scenarioLimit
    : true;

  function onScenarioSaved() {
    refetch();
    qc.invalidateQueries({ queryKey: ['/api/scenarios'] });
  }

  return (
    <PortalLayout activeModule={module} account={account}>
      <div className="p-6 max-w-5xl mx-auto">
        {module === 'beranda' && (
          <BerandaPage account={account} />
        )}
        {module === 'target-mundur' && (
          <CalculatorPage canSave={canSave} onScenarioSaved={onScenarioSaved} />
        )}
        {module === 'hpp' && (
          <HppCalculatorPage canSave={canSave} onScenarioSaved={onScenarioSaved} />
        )}
        {module === 'bep-usaha' && (
          <BepUsahaCalculatorPage canSave={canSave} onScenarioSaved={onScenarioSaved} />
        )}
        {module === 'harga-jual' && (
          <HargaJualCalculatorPage canSave={canSave} onScenarioSaved={onScenarioSaved} />
        )}
        {module === 'pajak' && (
          <PajakCalculatorPage canSave={canSave} onScenarioSaved={onScenarioSaved} />
        )}
        {module === 'ekspansi' && (
          <EkspansiCalculatorPage canSave={canSave} onScenarioSaved={onScenarioSaved} />
        )}
        {module === 'pinjaman' && (
          <PinjamanCalculatorPage canSave={canSave} onScenarioSaved={onScenarioSaved} />
        )}
        {module === 'skenario' && (
          <ScenariosPage />
        )}
      </div>
    </PortalLayout>
  );
}
