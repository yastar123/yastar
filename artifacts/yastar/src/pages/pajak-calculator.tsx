import { useState } from 'react';
import { Receipt, Save, Sparkles, AlertTriangle } from 'lucide-react';
import type { PajakInput, PajakResult } from '@workspace/api-client-react';
import { useCalculatePajak, useCreateModuleScenario } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CurrencyInput } from '@/components/currency-input';
import { InsightList } from '@/components/insight-list';
import { useToast } from '@/hooks/use-toast';
import { formatIDR } from '@/lib/format';

interface Props { canSave: boolean; onScenarioSaved: () => void; }

export default function PajakCalculatorPage({ canSave, onScenarioSaved }: Props) {
  const [skema, setSkema] = useState<'ppfinal' | 'normal'>('ppfinal');
  const [omzet, setOmzet] = useState(50_000_000);
  const [biaya, setBiaya] = useState(0);
  const [result, setResult] = useState<PajakResult | null>(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const [scenarioName, setScenarioName] = useState('');
  const { toast } = useToast();

  const calculate = useCalculatePajak({
    mutation: {
      onSuccess: (data) => setResult(data),
      onError: () => toast({ title: 'Perhitungan gagal', variant: 'destructive' }),
    },
  });
  const createScenario = useCreateModuleScenario({
    mutation: {
      onSuccess: () => { setSaveOpen(false); setScenarioName(''); toast({ title: 'Skenario disimpan' }); onScenarioSaved(); },
      onError: () => toast({ title: 'Gagal menyimpan', variant: 'destructive' }),
    },
  });

  function buildInput(): PajakInput {
    return { omzetBulanan: omzet, skema, totalBiayaBulanan: skema === 'normal' ? biaya : null };
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6" data-testid="page-pajak">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Receipt className="h-5 w-5 text-primary" />Estimasi Pajak UMKM</CardTitle>
          <CardDescription>Estimasi PPh berdasarkan omzet bulanan. Hanya untuk gambaran umum.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <Tabs value={skema} onValueChange={(v) => { setSkema(v as typeof skema); setResult(null); }}>
            <TabsList className="w-full">
              <TabsTrigger value="ppfinal" className="flex-1">PPh Final 0,5% (PP 23/2018)</TabsTrigger>
              <TabsTrigger value="normal" className="flex-1">PPh Pasal 17 (Normal)</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-col gap-1.5">
            <Label>Omzet Bulanan (Rp)</Label>
            <CurrencyInput value={omzet} onValueChange={setOmzet} />
          </div>

          {skema === 'normal' && (
            <div className="flex flex-col gap-1.5">
              <Label>Total Biaya Bulanan (Rp) <span className="text-muted-foreground text-xs">— untuk estimasi laba kena pajak</span></Label>
              <CurrencyInput value={biaya} onValueChange={setBiaya} />
            </div>
          )}

          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>Modul ini hanya memberikan estimasi umum. Konsultasikan dengan konsultan pajak atau akuntan resmi untuk angka final yang akurat.</p>
          </div>

          <Button onClick={() => calculate.mutate({ data: buildInput() })} disabled={calculate.isPending} className="w-full">
            <Sparkles className="h-4 w-4 mr-2" />
            {calculate.isPending ? 'Menghitung...' : 'Hitung Estimasi'}
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        {result ? (
          <>
            <Card className="border-primary/30">
              <CardHeader className="pb-3"><CardTitle>Estimasi Pajak Bulanan</CardTitle></CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <span className="text-xs text-muted-foreground block">Estimasi PPh Bulanan ({skema === 'ppfinal' ? 'PPh Final 0,5%' : 'PPh Pasal 17'})</span>
                  <span className="text-4xl font-bold text-primary">{formatIDR(result.pajakBulanan)}</span>
                  <span className="text-xs text-muted-foreground block mt-1">≈ {formatIDR(result.pajakBulanan * 12)} / tahun</span>
                </div>
              </CardContent>
            </Card>
            <InsightList insights={result.insights} />
            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border text-muted-foreground text-xs">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>{result.disclaimer}</p>
            </div>
            <Button variant="outline" disabled={!canSave} onClick={() => setSaveOpen(true)}>
              <Save className="h-4 w-4 mr-2" /> Simpan Skenario
            </Button>
          </>
        ) : (
          <Card className="h-full flex items-center justify-center border-dashed">
            <CardContent className="text-center py-16 text-muted-foreground">
              <Receipt className="h-8 w-8 mx-auto mb-3 opacity-40" />
              <p>Isi omzet dan klik "Hitung Estimasi" untuk melihat perkiraan pajak.</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Simpan Skenario Pajak</DialogTitle><DialogDescription>Beri nama skenario ini.</DialogDescription></DialogHeader>
          <Input value={scenarioName} onChange={e => setScenarioName(e.target.value)} placeholder="Cth: Estimasi pajak Q1 2025" />
          <DialogFooter>
            <Button disabled={!scenarioName.trim() || createScenario.isPending} onClick={() => result && createScenario.mutate({ data: { name: scenarioName.trim(), moduleType: 'pajak', moduleInput: buildInput() as Record<string, unknown>, resultSnapshot: result as Record<string, unknown> } })}>
              {createScenario.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
