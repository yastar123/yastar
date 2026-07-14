import { useState } from 'react';
import { Calculator as CalculatorIcon, Save, Sparkles } from 'lucide-react';
import type {
  BusinessType,
  CommissionConfig,
  CommissionModel,
  ReverseTargetInput,
  ReverseTargetResult,
  ServiceItem,
} from '@workspace/api-client-react';
import { useCalculateReverseTarget, useCreateScenario } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CurrencyInput } from '@/components/currency-input';
import { ServiceListInput } from '@/components/service-list-input';
import { CommissionConfigInput } from '@/components/commission-config-input';
import { InsightList } from '@/components/insight-list';
import { useToast } from '@/hooks/use-toast';
import { BUSINESS_TYPE_LABELS, formatIDR, formatNumber } from '@/lib/format';

const DEFAULT_INPUT: ReverseTargetInput = {
  businessType: 'salon',
  employeeCount: 3,
  workingDaysPerMonth: 24,
  workingHoursPerDay: 8,
  fixedCosts: 15_000_000,
  targetProfit: 20_000_000,
  commissionModel: 'flat',
  commissionConfig: { flatPercent: 40 },
  services: [{ name: 'Potong rambut', price: 50_000, durationMinutes: 45 }],
};

interface CalculatorPageProps {
  canSave: boolean;
  onScenarioSaved: () => void;
}

export default function CalculatorPage({ canSave, onScenarioSaved }: CalculatorPageProps) {
  const [input, setInput] = useState<ReverseTargetInput>(DEFAULT_INPUT);
  const [result, setResult] = useState<ReverseTargetResult | null>(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const [scenarioName, setScenarioName] = useState('');
  const { toast } = useToast();

  const calculate = useCalculateReverseTarget({
    mutation: {
      onSuccess: (data) => setResult(data),
      onError: () =>
        toast({
          title: 'Perhitungan gagal',
          description: 'Periksa kembali data yang dimasukkan.',
          variant: 'destructive',
        }),
    },
  });

  const createScenario = useCreateScenario({
    mutation: {
      onSuccess: () => {
        setSaveOpen(false);
        setScenarioName('');
        toast({ title: 'Skenario disimpan', description: 'Kamu bisa membukanya kembali di tab Skenario.' });
        onScenarioSaved();
      },
      onError: (error: unknown) => {
        const message =
          error && typeof error === 'object' && 'body' in error
            ? String((error as { body?: { error?: string } }).body?.error ?? '')
            : '';
        toast({
          title: 'Gagal menyimpan skenario',
          description: message.includes('limit')
            ? 'Batas jumlah skenario pada paketmu sudah tercapai. Upgrade paket untuk menyimpan lebih banyak.'
            : 'Terjadi kesalahan saat menyimpan skenario.',
          variant: 'destructive',
        });
      },
    },
  });

  function patch(fields: Partial<ReverseTargetInput>) {
    setInput((prev) => ({ ...prev, ...fields }));
  }

  function runCalculation() {
    calculate.mutate({ data: input });
  }

  function confirmSave() {
    if (!scenarioName.trim()) return;
    createScenario.mutate({ data: { ...input, name: scenarioName.trim() } });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6" data-testid="page-calculator">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalculatorIcon className="h-5 w-5 text-primary" />
            Kalkulator Target Terbalik
          </CardTitle>
          <CardDescription>
            Masukkan target laba yang ingin kamu capai — kami hitung berapa klien yang
            dibutuhkan untuk mencapainya.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Jenis Usaha</Label>
              <Select
                value={input.businessType}
                onValueChange={(v) => patch({ businessType: v as BusinessType })}
              >
                <SelectTrigger data-testid="select-business-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(BUSINESS_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Jumlah Karyawan</Label>
              <Input
                type="number"
                min={1}
                value={input.employeeCount}
                onChange={(e) => patch({ employeeCount: Number(e.target.value) })}
                data-testid="input-employee-count"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Hari Kerja / Bulan</Label>
              <Input
                type="number"
                min={1}
                max={31}
                value={input.workingDaysPerMonth}
                onChange={(e) => patch({ workingDaysPerMonth: Number(e.target.value) })}
                data-testid="input-working-days"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Jam Kerja / Hari</Label>
              <Input
                type="number"
                min={1}
                max={24}
                value={input.workingHoursPerDay}
                onChange={(e) => patch({ workingHoursPerDay: Number(e.target.value) })}
                data-testid="input-working-hours"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Biaya Tetap / Bulan (Rp)</Label>
              <CurrencyInput
                value={input.fixedCosts}
                onValueChange={(v) => patch({ fixedCosts: v })}
                data-testid="input-fixed-costs"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Target Laba / Bulan (Rp)</Label>
              <CurrencyInput
                value={input.targetProfit}
                onValueChange={(v) => patch({ targetProfit: v })}
                data-testid="input-target-profit"
              />
            </div>
          </div>

          <ServiceListInput
            services={input.services}
            onChange={(services: ServiceItem[]) => patch({ services })}
          />

          <CommissionConfigInput
            model={input.commissionModel}
            config={input.commissionConfig}
            onModelChange={(commissionModel: CommissionModel) => patch({ commissionModel })}
            onConfigChange={(commissionConfig: CommissionConfig) => patch({ commissionConfig })}
          />

          <Button
            onClick={runCalculation}
            disabled={calculate.isPending}
            className="w-full"
            data-testid="button-calculate"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {calculate.isPending ? 'Menghitung...' : 'Hitung Target'}
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        {result ? (
          <>
            <Card className={result.isRealistic ? 'border-primary/30' : 'border-destructive/30'}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Hasil Perhitungan</CardTitle>
                  <Badge variant={result.isRealistic ? 'default' : 'destructive'} data-testid="badge-realistic">
                    {result.isRealistic ? 'Realistis' : 'Perlu Ditinjau'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <Metric
                    label="Klien dibutuhkan / bulan"
                    value={formatNumber(result.clientsNeededTotal, 0)}
                    testId="metric-clients-total"
                  />
                  <Metric
                    label="Klien / karyawan / bulan"
                    value={formatNumber(result.clientsNeededPerEmployee, 1)}
                    testId="metric-clients-per-employee"
                  />
                  <Metric
                    label="Klien / karyawan / hari"
                    value={formatNumber(result.clientsNeededPerDayPerEmployee, 1)}
                    testId="metric-clients-per-day"
                  />
                  <Metric
                    label="Tingkat Utilisasi"
                    value={`${formatNumber(result.utilizationPercent, 0)}%`}
                    testId="metric-utilization"
                  />
                  <Metric
                    label="Laba bersih / klien"
                    value={formatIDR(result.netProfitPerClient)}
                    testId="metric-net-profit-per-client"
                  />
                  <Metric
                    label="Margin Laba"
                    value={`${formatNumber(result.marginPercent, 1)}%`}
                    testId="metric-margin"
                  />
                </div>
                <div className="text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-3">
                  <span>Total biaya/bulan: {formatIDR(result.totalCostsMonthly)}</span>
                  <span>Harga rata-rata jasa: {formatIDR(result.avgServicePrice)}</span>
                  <span>Kapasitas maksimum: {formatNumber(result.maxCapacityTotalPerMonth, 0)} klien</span>
                </div>
              </CardContent>
            </Card>

            <InsightList insights={result.insights} />

            <Button
              variant="outline"
              onClick={() => setSaveOpen(true)}
              disabled={!canSave}
              data-testid="button-open-save-scenario"
            >
              <Save className="h-4 w-4 mr-2" />
              Simpan sebagai Skenario
            </Button>
            {!canSave && (
              <p className="text-xs text-muted-foreground">
                Batas skenario tersimpan pada paketmu sudah tercapai.
              </p>
            )}
          </>
        ) : (
          <Card className="h-full flex items-center justify-center border-dashed">
            <CardContent className="text-center py-16 text-muted-foreground">
              <CalculatorIcon className="h-8 w-8 mx-auto mb-3 opacity-40" />
              <p>Isi data usahamu dan klik "Hitung Target" untuk melihat hasilnya.</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent data-testid="dialog-save-scenario">
          <DialogHeader>
            <DialogTitle>Simpan Skenario</DialogTitle>
            <DialogDescription>
              Beri nama skenario ini agar mudah ditemukan kembali nanti.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={scenarioName}
            onChange={(e) => setScenarioName(e.target.value)}
            placeholder="Cth: Target laba akhir tahun"
            data-testid="input-scenario-name"
          />
          <DialogFooter>
            <Button
              onClick={confirmSave}
              disabled={!scenarioName.trim() || createScenario.isPending}
              data-testid="button-confirm-save-scenario"
            >
              {createScenario.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Metric({ label, value, testId }: { label: string; value: string; testId: string }) {
  return (
    <div className="flex flex-col gap-0.5" data-testid={testId}>
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xl font-semibold tabular-nums">{value}</span>
    </div>
  );
}
