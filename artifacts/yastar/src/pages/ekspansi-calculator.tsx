import { useState } from 'react';
import { Building2, Save, Sparkles } from 'lucide-react';
import type { EkspansiInput, EkspansiResult } from '@workspace/api-client-react';
import { useCalculateEkspansi, useCreateModuleScenario, useListCostItems } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CurrencyInput } from '@/components/currency-input';
import { InsightList } from '@/components/insight-list';
import { useToast } from '@/hooks/use-toast';
import { formatIDR, formatNumber } from '@/lib/format';

interface Props { canSave: boolean; onScenarioSaved: () => void; }

const DEFAULT: EkspansiInput = { modalAwal: 100_000_000, revenueBulanan: 50_000_000, biayaTetapBulanan: 15_000_000, hppPercentOfRevenue: 40 };

export default function EkspansiCalculatorPage({ canSave, onScenarioSaved }: Props) {
  const [input, setInput] = useState<EkspansiInput>(DEFAULT);
  const [result, setResult] = useState<EkspansiResult | null>(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const [scenarioName, setScenarioName] = useState('');
  const { toast } = useToast();
  const { data: costItems = [] } = useListCostItems();

  const calculate = useCalculateEkspansi({
    mutation: {
      onSuccess: (data) => setResult(data),
      onError: () => toast({ title: 'Perhitungan gagal', variant: 'destructive' }),
    },
  });
  const createScenario = useCreateModuleScenario({
    mutation: {
      onSuccess: () => { setSaveOpen(false); setScenarioName(''); toast({ title: 'Skenario disimpan' }); onScenarioSaved(); },
      onError: () => toast({ title: 'Gagal menyimpan skenario', variant: 'destructive' }),
    },
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6" data-testid="page-ekspansi">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" />Kelayakan Cabang Baru</CardTitle>
          <CardDescription>Proyeksikan payback period dan ROI sebelum memutuskan ekspansi.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {costItems.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm">Estimasi HPP dari Cost Items (opsional)</Label>
              <Select onValueChange={(id) => {
                const item = costItems.find(c => String(c.id) === id);
                if (item) {
                  const r = item.hppResult as Record<string, unknown>;
                  const sp = (item.hppInput as Record<string, number>).sellingPrice;
                  if (sp && sp > 0 && typeof r.hpp === 'number') {
                    setInput(p => ({ ...p, hppPercentOfRevenue: Math.round((r.hpp as number) / sp * 100) }));
                  }
                }
              }}>
                <SelectTrigger><SelectValue placeholder="Pilih cost item..." /></SelectTrigger>
                <SelectContent>
                  {costItems.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.nama}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label>Modal Awal (Rp) — sewa deposit, renovasi, peralatan</Label>
            <CurrencyInput value={input.modalAwal} onValueChange={v => setInput(p => ({ ...p, modalAwal: v }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Proyeksi Revenue / Bulan (Rp)</Label>
              <CurrencyInput value={input.revenueBulanan} onValueChange={v => setInput(p => ({ ...p, revenueBulanan: v }))} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Biaya Tetap / Bulan (Rp)</Label>
              <CurrencyInput value={input.biayaTetapBulanan} onValueChange={v => setInput(p => ({ ...p, biayaTetapBulanan: v }))} />
            </div>
            <div className="flex flex-col gap-1.5 col-span-2">
              <Label className="text-sm">HPP sebagai % dari Revenue</Label>
              <Input type="number" min={0} max={100} step={0.5} value={input.hppPercentOfRevenue} onChange={e => setInput(p => ({ ...p, hppPercentOfRevenue: Number(e.target.value) }))} />
            </div>
          </div>

          <Button onClick={() => calculate.mutate({ data: input })} disabled={calculate.isPending} className="w-full">
            <Sparkles className="h-4 w-4 mr-2" />
            {calculate.isPending ? 'Menghitung...' : 'Hitung Kelayakan'}
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        {result ? (
          <>
            <Card className="border-primary/30">
              <CardHeader className="pb-3"><CardTitle>Hasil Analisis Ekspansi</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">Profit Proyeksi / Bulan</span>
                    <span className={`text-xl font-bold ${result.profitBulananProyeksi < 0 ? 'text-destructive' : 'text-primary'}`}>
                      {formatIDR(result.profitBulananProyeksi)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">ROI Tahunan Proyeksi</span>
                    <span className="text-xl font-bold">{Number.isFinite(result.roiTahunan) ? `${formatNumber(result.roiTahunan, 1)}%` : '—'}</span>
                  </div>
                  <div className="col-span-2 bg-primary/5 rounded-lg p-4 text-center">
                    <span className="text-xs text-muted-foreground block">Payback Period</span>
                    <span className="text-3xl font-bold text-primary">
                      {Number.isFinite(result.paybackPeriodBulan) ? `${formatNumber(result.paybackPeriodBulan, 0)} bulan` : '∞'}
                    </span>
                    {Number.isFinite(result.paybackPeriodTahun) && (
                      <span className="text-sm text-muted-foreground">≈ {formatNumber(result.paybackPeriodTahun, 1)} tahun</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            <InsightList insights={result.insights} />
            <Button variant="outline" disabled={!canSave} onClick={() => setSaveOpen(true)}>
              <Save className="h-4 w-4 mr-2" /> Simpan Skenario
            </Button>
          </>
        ) : (
          <Card className="h-full flex items-center justify-center border-dashed">
            <CardContent className="text-center py-16 text-muted-foreground">
              <Building2 className="h-8 w-8 mx-auto mb-3 opacity-40" />
              <p>Isi data proyeksi cabang baru dan klik "Hitung Kelayakan".</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Simpan Skenario Ekspansi</DialogTitle><DialogDescription>Beri nama skenario ini.</DialogDescription></DialogHeader>
          <Input value={scenarioName} onChange={e => setScenarioName(e.target.value)} placeholder="Cth: Cabang Kelapa Gading 2025" />
          <DialogFooter>
            <Button disabled={!scenarioName.trim() || createScenario.isPending} onClick={() => result && createScenario.mutate({ data: { name: scenarioName.trim(), moduleType: 'ekspansi', moduleInput: input as Record<string, unknown>, resultSnapshot: result as Record<string, unknown> } })}>
              {createScenario.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
