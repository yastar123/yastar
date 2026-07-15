import { useState } from 'react';
import { TrendingUp, Save, Sparkles } from 'lucide-react';
import type { BepUsahaInput, BepUsahaResult } from '@workspace/api-client-react';
import { useCalculateBepUsaha, useCreateModuleScenario, useListCostItems } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { CurrencyInput } from '@/components/currency-input';
import { InsightList } from '@/components/insight-list';
import { useToast } from '@/hooks/use-toast';
import { formatIDR, formatNumber } from '@/lib/format';

interface Props { canSave: boolean; onScenarioSaved: () => void; }

const DEFAULT: BepUsahaInput = { totalBiayaTetapBulanan: 10_000_000, hargaJualPerUnit: 150_000, hppPerUnit: 50_000 };

export default function BepUsahaCalculatorPage({ canSave, onScenarioSaved }: Props) {
  const [input, setInput] = useState<BepUsahaInput>(DEFAULT);
  const [result, setResult] = useState<BepUsahaResult | null>(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const [scenarioName, setScenarioName] = useState('');
  const { toast } = useToast();
  const { data: costItems = [] } = useListCostItems();

  const calculate = useCalculateBepUsaha({
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
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6" data-testid="page-bep-usaha">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Titik Impas Usaha (BEP)
          </CardTitle>
          <CardDescription>
            Hitung berapa unit/sesi per bulan yang harus terjual agar bisnis mencapai titik impas.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {costItems.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm">Pilih HPP dari Cost Items (opsional)</Label>
              <Select onValueChange={(id) => {
                const item = costItems.find(c => String(c.id) === id);
                if (item) {
                  const r = item.hppResult as Record<string, number>;
                  setInput(prev => ({ ...prev, hppPerUnit: r.hpp ?? prev.hppPerUnit }));
                }
              }}>
                <SelectTrigger><SelectValue placeholder="Pilih cost item tersimpan..." /></SelectTrigger>
                <SelectContent>
                  {costItems.map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.nama}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label>Total Biaya Tetap Bulanan (Rp)</Label>
            <CurrencyInput value={input.totalBiayaTetapBulanan} onValueChange={v => setInput(p => ({ ...p, totalBiayaTetapBulanan: v }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Harga Jual per Unit/Sesi (Rp)</Label>
              <CurrencyInput value={input.hargaJualPerUnit} onValueChange={v => setInput(p => ({ ...p, hargaJualPerUnit: v }))} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>HPP per Unit/Sesi (Rp)</Label>
              <CurrencyInput value={input.hppPerUnit} onValueChange={v => setInput(p => ({ ...p, hppPerUnit: v }))} />
            </div>
          </div>

          <Button onClick={() => calculate.mutate({ data: input })} disabled={calculate.isPending} className="w-full">
            <Sparkles className="h-4 w-4 mr-2" />
            {calculate.isPending ? 'Menghitung...' : 'Hitung BEP'}
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        {result ? (
          <>
            <Card className="border-primary/30">
              <CardHeader className="pb-3"><CardTitle>Hasil BEP Usaha</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 bg-primary/5 rounded-lg p-4 text-center">
                    <span className="text-xs text-muted-foreground block">Unit / Sesi per Bulan untuk BEP</span>
                    <span className="text-3xl font-bold text-primary">{Number.isFinite(result.unitBepBulanan) ? formatNumber(result.unitBepBulanan, 0) : '∞'}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">Contribution Margin / Unit</span>
                    <span className="text-lg font-semibold">{formatIDR(result.kontribusiMarginPerUnit)}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">Revenue BEP / Bulan</span>
                    <span className="text-lg font-semibold">{Number.isFinite(result.revenueBepBulanan) ? formatIDR(result.revenueBepBulanan) : '—'}</span>
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
              <TrendingUp className="h-8 w-8 mx-auto mb-3 opacity-40" />
              <p>Isi data dan klik "Hitung BEP" untuk melihat titik impas usahamu.</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Simpan Skenario BEP Usaha</DialogTitle><DialogDescription>Beri nama skenario ini.</DialogDescription></DialogHeader>
          <Input value={scenarioName} onChange={e => setScenarioName(e.target.value)} placeholder="Cth: BEP Salon Utama 2025" />
          <DialogFooter>
            <Button disabled={!scenarioName.trim() || createScenario.isPending} onClick={() => result && createScenario.mutate({ data: { name: scenarioName.trim(), moduleType: 'bep_usaha', moduleInput: input as Record<string, unknown>, resultSnapshot: result as Record<string, unknown> } })}>
              {createScenario.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
