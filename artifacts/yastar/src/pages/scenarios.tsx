import { useState } from 'react';
import { CalendarClock, Layers, Trash2 } from 'lucide-react';
import { useDeleteScenario, useListScenarios } from '@workspace/api-client-react';
import type { Scenario } from '@workspace/api-client-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { formatDate, formatIDR, formatNumber } from '@/lib/format';

const MODULE_LABELS: Record<string, string> = {
  target_mundur: 'Target Profit → Klien',
  break_even_karyawan: 'BEP Karyawan',
  hpp: 'Hitung HPP',
  harga_jual: 'Uji Harga Jual',
  bep_usaha: 'Titik Impas Usaha',
  ekspansi: 'Kelayakan Cabang',
  pinjaman: 'Simulasi Pinjaman',
  pajak: 'Estimasi Pajak',
};

const ALL_MODULE_TYPES = Object.keys(MODULE_LABELS);

function ScenarioSummary({ scenario }: { scenario: Scenario }) {
  const mt = scenario.moduleType ?? 'target_mundur';
  const result = scenario.resultSnapshot as Record<string, unknown>;

  if (mt === 'target_mundur') {
    return (
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-xs text-muted-foreground block">Target laba</span>
          <span className="font-medium">{formatIDR(scenario.targetProfit)}</span>
        </div>
        <div>
          <span className="text-xs text-muted-foreground block">Klien dibutuhkan</span>
          <span className="font-medium">
            {formatNumber(result.clientsNeededTotal as number, 0)} / bulan
          </span>
        </div>
        <div>
          <span className="text-xs text-muted-foreground block">Utilisasi</span>
          <span className="font-medium">{formatNumber(result.utilizationPercent as number, 0)}%</span>
        </div>
        <div>
          <span className="text-xs text-muted-foreground block">Status</span>
          <Badge variant={(result.isRealistic as boolean) ? 'default' : 'destructive'}>
            {(result.isRealistic as boolean) ? 'Realistis' : 'Perlu ditinjau'}
          </Badge>
        </div>
      </div>
    );
  }

  if (mt === 'hpp') {
    return (
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-xs text-muted-foreground block">HPP</span>
          <span className="font-medium">{formatIDR(result.hpp as number)}</span>
        </div>
        {result.margin !== null && result.margin !== undefined && (
          <div>
            <span className="text-xs text-muted-foreground block">Margin</span>
            <span className="font-medium">{formatNumber(result.margin as number, 1)}%</span>
          </div>
        )}
      </div>
    );
  }

  if (mt === 'bep_usaha') {
    return (
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-xs text-muted-foreground block">Unit BEP / Bulan</span>
          <span className="font-medium">
            {Number.isFinite(result.unitBepBulanan as number) ? formatNumber(result.unitBepBulanan as number, 0) : '∞'}
          </span>
        </div>
        <div>
          <span className="text-xs text-muted-foreground block">Revenue BEP</span>
          <span className="font-medium">
            {Number.isFinite(result.revenueBepBulanan as number) ? formatIDR(result.revenueBepBulanan as number) : '—'}
          </span>
        </div>
      </div>
    );
  }

  if (mt === 'harga_jual') {
    return (
      <div className="grid grid-cols-2 gap-3 text-sm">
        {result.hargaDariMargin !== null && (
          <div>
            <span className="text-xs text-muted-foreground block">Harga dari Margin</span>
            <span className="font-medium">{formatIDR(result.hargaDariMargin as number)}</span>
          </div>
        )}
        {result.marginAktual !== null && result.marginAktual !== undefined && (
          <div>
            <span className="text-xs text-muted-foreground block">Margin Aktual</span>
            <span className="font-medium">{formatNumber(result.marginAktual as number, 1)}%</span>
          </div>
        )}
        <div>
          <span className="text-xs text-muted-foreground block">HPP</span>
          <span className="font-medium">{formatIDR(result.hpp as number)}</span>
        </div>
      </div>
    );
  }

  if (mt === 'pajak') {
    return (
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-xs text-muted-foreground block">Pajak / Bulan</span>
          <span className="font-medium">{formatIDR(result.pajakBulanan as number)}</span>
        </div>
        <div>
          <span className="text-xs text-muted-foreground block">Skema</span>
          <span className="font-medium">{result.skema === 'ppfinal' ? 'PPh Final 0,5%' : 'PPh Pasal 17'}</span>
        </div>
      </div>
    );
  }

  if (mt === 'ekspansi') {
    return (
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-xs text-muted-foreground block">Payback Period</span>
          <span className="font-medium">
            {Number.isFinite(result.paybackPeriodBulan as number) ? `${formatNumber(result.paybackPeriodBulan as number, 0)} bulan` : '∞'}
          </span>
        </div>
        <div>
          <span className="text-xs text-muted-foreground block">ROI Tahunan</span>
          <span className="font-medium">
            {Number.isFinite(result.roiTahunan as number) ? `${formatNumber(result.roiTahunan as number, 1)}%` : '—'}
          </span>
        </div>
      </div>
    );
  }

  if (mt === 'pinjaman') {
    return (
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-xs text-muted-foreground block">Cicilan / Bulan</span>
          <span className="font-medium">{formatIDR(result.cicilanBulanan as number)}</span>
        </div>
        <div>
          <span className="text-xs text-muted-foreground block">Total Bunga</span>
          <span className="font-medium">{formatIDR(result.totalBunga as number)}</span>
        </div>
      </div>
    );
  }

  // fallback
  return (
    <p className="text-xs text-muted-foreground">Lihat detail skenario untuk informasi lengkap.</p>
  );
}

export default function ScenariosPage() {
  const { data: scenarios = [], isLoading } = useListScenarios();
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [filterModule, setFilterModule] = useState<string>('all');
  const { toast } = useToast();

  const deleteScenario = useDeleteScenario({
    mutation: {
      onSuccess: () => {
        setPendingDeleteId(null);
        toast({ title: 'Skenario dihapus' });
      },
      onError: () =>
        toast({ title: 'Gagal menghapus skenario', variant: 'destructive' }),
    },
  });

  const filtered = filterModule === 'all'
    ? scenarios
    : scenarios.filter(s => (s.moduleType ?? 'target_mundur') === filterModule);

  // Find which module types are actually used
  const usedModuleTypes = [...new Set(scenarios.map(s => s.moduleType ?? 'target_mundur'))];

  if (isLoading) {
    return <p className="text-muted-foreground" data-testid="text-scenarios-loading">Memuat skenario...</p>;
  }

  if (scenarios.length === 0) {
    return (
      <Card className="border-dashed" data-testid="card-scenarios-empty">
        <CardContent className="text-center py-16 text-muted-foreground">
          <Layers className="h-8 w-8 mx-auto mb-3 opacity-40" />
          <p>Belum ada skenario tersimpan. Jalankan simulasi di tab "Simulasi Bisnis" lalu simpan hasilnya.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div data-testid="page-scenarios">
      {usedModuleTypes.length > 1 && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-muted-foreground">Filter:</span>
          <Select value={filterModule} onValueChange={setFilterModule}>
            <SelectTrigger className="w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Modul</SelectItem>
              {usedModuleTypes.map(mt => (
                <SelectItem key={mt} value={mt}>{MODULE_LABELS[mt] ?? mt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">{filtered.length} skenario</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((scenario) => (
          <Card key={scenario.id} data-testid={`card-scenario-${scenario.id}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base">{scenario.name}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <CalendarClock className="h-3 w-3" /> {formatDate(scenario.createdAt)}
                  </p>
                </div>
                <Badge variant="outline" className="shrink-0 text-xs">
                  {MODULE_LABELS[scenario.moduleType ?? 'target_mundur'] ?? scenario.moduleType}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <ScenarioSummary scenario={scenario} />
              <Button
                variant="ghost"
                size="sm"
                className="self-end text-destructive hover:text-destructive"
                onClick={() => setPendingDeleteId(scenario.id)}
                data-testid={`button-delete-scenario-${scenario.id}`}
              >
                <Trash2 className="h-4 w-4 mr-1" /> Hapus
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={pendingDeleteId !== null} onOpenChange={(open) => !open && setPendingDeleteId(null)}>
        <DialogContent data-testid="dialog-delete-scenario">
          <DialogHeader>
            <DialogTitle>Hapus skenario ini?</DialogTitle>
            <DialogDescription>Tindakan ini tidak dapat dibatalkan.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDeleteId(null)}>Batal</Button>
            <Button
              variant="destructive"
              disabled={deleteScenario.isPending}
              onClick={() => pendingDeleteId && deleteScenario.mutate({ id: pendingDeleteId })}
              data-testid="button-confirm-delete-scenario"
            >
              {deleteScenario.isPending ? 'Menghapus...' : 'Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
