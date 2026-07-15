import { useState } from 'react';
import { Tag, Save, Sparkles } from 'lucide-react';
import type { HargaJualInput, HargaJualResult } from '@workspace/api-client-react';
import { useCalculateHargaJual, useCreateModuleScenario, useListCostItems } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CurrencyInput } from '@/components/currency-input';
import { InsightList } from '@/components/insight-list';
import { useToast } from '@/hooks/use-toast';
import { formatIDR, formatNumber } from '@/lib/format';

interface Props { canSave: boolean; onScenarioSaved: () => void; }

export default function HargaJualCalculatorPage({ canSave, onScenarioSaved }: Props) {
  const [mode, setMode] = useState<'dari_hpp' | 'dari_harga'>('dari_hpp');
  const [hpp, setHpp] = useState(0);
  const [targetMargin, setTargetMargin] = useState<number | null>(30);
  const [targetMarkup, setTargetMarkup] = useState<number | null>(null);
  const [hargaJual, setHargaJual] = useState(0);
  const [result, setResult] = useState<HargaJualResult | null>(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const [scenarioName, setScenarioName] = useState('');
  const { toast } = useToast();
  const { data: costItems = [] } = useListCostItems();

  const calculate = useCalculateHargaJual({
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

  function buildInput(): HargaJualInput {
    return mode === 'dari_hpp'
      ? { mode, hpp, targetMarginPercent: targetMargin, targetMarkupPercent: targetMarkup, hargaJual: null }
      : { mode, hpp, hargaJual, targetMarginPercent: null, targetMarkupPercent: null };
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6" data-testid="page-harga-jual">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Tag className="h-5 w-5 text-primary" />Uji Harga Jual & Margin</CardTitle>
          <CardDescription>Dua arah: dari HPP ke harga jual ideal, atau dari harga jual ke margin aktual.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <Tabs value={mode} onValueChange={(v) => { setMode(v as typeof mode); setResult(null); }}>
            <TabsList className="w-full">
              <TabsTrigger value="dari_hpp" className="flex-1">HPP → Harga Jual</TabsTrigger>
              <TabsTrigger value="dari_harga" className="flex-1">Harga Jual → Margin</TabsTrigger>
            </TabsList>
          </Tabs>

          {costItems.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm">Pilih HPP dari Cost Items (opsional)</Label>
              <Select onValueChange={(id) => {
                const item = costItems.find(c => String(c.id) === id);
                if (item) setHpp((item.hppResult as Record<string, number>).hpp ?? 0);
              }}>
                <SelectTrigger><SelectValue placeholder="Pilih cost item..." /></SelectTrigger>
                <SelectContent>
                  {costItems.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.nama}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label>HPP per Unit/Sesi (Rp)</Label>
            <CurrencyInput value={hpp} onValueChange={setHpp} />
          </div>

          {mode === 'dari_hpp' ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm">Target Margin (%) <span className="text-muted-foreground text-xs">dari harga jual</span></Label>
                <Input type="number" min={0} max={99} step={0.5}
                  value={targetMargin ?? ''}
                  onChange={e => setTargetMargin(e.target.value ? Number(e.target.value) : null)}
                  placeholder="Cth: 30" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm">Target Markup (%) <span className="text-muted-foreground text-xs">dari HPP</span></Label>
                <Input type="number" min={0} step={0.5}
                  value={targetMarkup ?? ''}
                  onChange={e => setTargetMarkup(e.target.value ? Number(e.target.value) : null)}
                  placeholder="Cth: 50" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <Label>Harga Jual yang Ingin Diuji (Rp)</Label>
              <CurrencyInput value={hargaJual} onValueChange={setHargaJual} />
            </div>
          )}

          <Button onClick={() => calculate.mutate({ data: buildInput() })} disabled={calculate.isPending} className="w-full">
            <Sparkles className="h-4 w-4 mr-2" />
            {calculate.isPending ? 'Menghitung...' : 'Hitung'}
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        {result ? (
          <>
            <Card className="border-primary/30">
              <CardHeader className="pb-3"><CardTitle>Hasil Analisis Harga Jual</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">HPP</span>
                    <span className="text-lg font-semibold">{formatIDR(result.hpp)}</span>
                  </div>
                  {result.hargaDariMargin !== null && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground">Harga Jual (dari target margin)</span>
                      <span className="text-lg font-semibold text-primary">{formatIDR(result.hargaDariMargin)}</span>
                    </div>
                  )}
                  {result.hargaDariMarkup !== null && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground">Harga Jual (dari target markup)</span>
                      <span className="text-lg font-semibold text-primary">{formatIDR(result.hargaDariMarkup)}</span>
                    </div>
                  )}
                  {result.marginAktual !== null && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground">Margin Aktual</span>
                      <span className="text-lg font-semibold">{formatNumber(result.marginAktual, 1)}%</span>
                    </div>
                  )}
                  {result.markupAktual !== null && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground">Markup dari HPP</span>
                      <span className="text-lg font-semibold">{formatNumber(result.markupAktual, 1)}%</span>
                    </div>
                  )}
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
              <Tag className="h-8 w-8 mx-auto mb-3 opacity-40" />
              <p>Isi data di kiri dan klik "Hitung" untuk melihat analisis harga jual.</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Simpan Skenario Harga Jual</DialogTitle><DialogDescription>Beri nama skenario ini.</DialogDescription></DialogHeader>
          <Input value={scenarioName} onChange={e => setScenarioName(e.target.value)} placeholder="Cth: Uji harga creambath premium" />
          <DialogFooter>
            <Button disabled={!scenarioName.trim() || createScenario.isPending} onClick={() => result && createScenario.mutate({ data: { name: scenarioName.trim(), moduleType: 'harga_jual', moduleInput: buildInput() as Record<string, unknown>, resultSnapshot: result as Record<string, unknown> } })}>
              {createScenario.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
