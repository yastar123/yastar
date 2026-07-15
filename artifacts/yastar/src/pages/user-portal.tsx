import { useState } from 'react';
import { Redirect } from 'wouter';
import { LogOut } from 'lucide-react';
import { useGetMyAccount } from '@workspace/api-client-react';
import { useOwnerAuth } from '@/lib/ownerAuth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CalculatorPage from '@/pages/calculator';
import ScenariosPage from '@/pages/scenarios';
import { TIER_LABELS } from '@/lib/format';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

export default function UserPortalPage() {
  const { session, logout } = useOwnerAuth();
  const [tab, setTab] = useState('calculator');
  const { data: account, refetch } = useGetMyAccount();

  if (!session?.authenticated) return <Redirect to="/" />;

  const usageLabel = account
    ? account.scenarioLimit === null
      ? `${account.scenarioCount} skenario tersimpan`
      : `${account.scenarioCount} / ${account.scenarioLimit} skenario`
    : null;

  const canSave = account
    ? account.scenarioLimit === null || account.scenarioCount < account.scenarioLimit
    : true;

  return (
    <div className="min-h-[100dvh] bg-background" data-testid="page-user-portal">
      <header className="border-b border-border bg-card">
        <div className="max-w-full mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={`${basePath}/logo.svg`} alt="Yastar" className="h-8 w-8 rounded-lg" />
            <span className="font-bold tracking-tight">Yastar</span>
          </div>
          <div className="flex items-center gap-3">
            {account && (
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <Badge variant="outline" data-testid="badge-account-tier">
                  {TIER_LABELS[account.tier]}
                </Badge>
                <span className="text-muted-foreground" data-testid="text-scenario-usage">
                  {usageLabel}
                </span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logout()}
              data-testid="button-sign-out"
            >
              <LogOut className="h-4 w-4 mr-1.5" /> Keluar
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-full mx-auto px-4 py-8">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="calculator" data-testid="tab-calculator">
              Kalkulator
            </TabsTrigger>
            <TabsTrigger value="scenarios" data-testid="tab-scenarios">
              Skenario Tersimpan
            </TabsTrigger>
          </TabsList>
          <TabsContent value="calculator">
            <CalculatorPage canSave={canSave} onScenarioSaved={() => refetch()} />
          </TabsContent>
          <TabsContent value="scenarios">
            <ScenariosPage />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
