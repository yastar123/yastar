import { useState } from 'react';
import { CreditCard, Save, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import type { PinjamanInput, PinjamanResult } from '@workspace/api-client-react';
import { useCalculatePinjaman, useCreateModuleScenario } from '@workspace/api-client-react';
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

const DEFAULT: PinjamanInput = { plafonPinjaman: 50_000_000, sukuBungaTahunan: 12, tenorBulan: 24, metode: 'anuitas', profitBulananSaatIni: null };

export default function PinjamanCalculatorPage({ canSave, onScenarioSaved }: Props) {
  const [input, setInput] = useState<PinjamanInput>(DEFAULT);
  const [result, setResult] = useState<PinjamanResult | null>(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const [scenarioName, setScenarioName] = useState('');
  const [showJadwal, setShowJadwal] = useState(false);
  const { toast } = useToast();

  const calculate = useCalculatePinjaman({
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
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6" data-testid="page-pinjaman">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" />Simulasi Pinjaman Modal</CardTitle>
          <CardDescription>Hitung cicilan, total bunga, dan dampak pinjaman ke profit usaha.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label>Plafon Pinjaman (Rp)</Label>
            <CurrencyInput value={input.plafonPinjaman} onValueChange={v => setInput(p => ({ ...p, plafonPinjaman: v }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Suku Bunga / Tahun (%)</Label>
              <Input type="number" min={0} max={100} step={0.1} value={input.sukuBungaTahunan} onChange={e => setInput(p => ({ ...p, sukuBungaTahunan: Number(e.target.value) }))} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Tenor (Bulan)</Label>
              <Input type="number" min={1} max={360} value={input.tenorBulan} onChange={e => setInput(p => ({ ...p, tenorBulan: Number(e.target.value) }))} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Metode Cicilan</Label>
            <Select value={input.metode} onValueChange={(v) => setInput(p => ({ ...p, metode: v as 'flat' | 'anuitas' }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="anuitas">Anuitas (cicilan tetap)</SelectItem>
                <SelectItem value="flat">Flat (bunga tetap dari pokok awal)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm">Profit Bulanan Saat Ini (Rp) <span className="text-muted-foreground text-xs">— opsional, untuk hitung dampak ke profit</span></Label>
            <CurrencyInput value={input.profitBulananSaatIni ?? 0} onValueChange={v => setInput(p => ({ ...p, profitBulananSaatIni: v > 0 ? v : null }))} />
          </div>

          <Button onClick={() => calculate.mutate({ data: input })} disabled={calculate.isPending} className="w-full">
            <Sparkles className="h-4 w-4 mr-2" />
            {calculate.isPending ? 'Menghitung...' : 'Simulasikan Pinjaman'}
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        {result ? (
          <>
            <Card className="border-primary/30">
              <CardHeader className="pb-3"><CardTitle>Hasil Simulasi Pinjaman</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 bg-primary/5 rounded-lg p-4 text-center">
                    <span className="text-xs text-muted-foreground block">Cicilan Bulanan ({input.metode === 'anuitas' ? 'Anuitas' : 'Flat'})</span>
                    <span className="text-3xl font-bold text-primary">{formatIDR(result.cicilanBulanan)}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">Total Bunga Dibayar</span>
                    <span className="text-lg font-semibold">{formatIDR(result.totalBunga)}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">Total Pembayaran</span>
                    <span className="text-lg font-semibold">{formatIDR(result.totalPembayaran)}</span>
                  </div>
                  {result.profitSetelahCicilan !== null && (
                    <div className="col-span-2 flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground">Profit Setelah Cicilan</span>
                      <span className={`text-xl font-bold ${result.profitSetelahCicilan < 0 ? 'text-destructive' : 'text-green-600'}`}>
                        {formatIDR(result.profitSetelahCicilan)}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mt-4 w-full justify-center"
                  onClick={() => setShowJadwal(v => !v)}
                >
                  {showJadwal ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  {showJadwal ? 'Sembunyikan' : 'Lihat'} jadwal angsuran ({result.jadwal.length} bulan)
                </button>
                {showJadwal && (
                  <div className="mt-3 overflow-x-auto max-h-64 overflow-y-auto rounded border border-border">
                    <table className="w-full text-xs">
                      <thead className="bg-muted sticky top-0">
                        <tr>
                          <th className="p-2 text-left">Bln</th>
                          <th className="p-2 text-right">Pokok</th>
                          <th className="p-2 text-right">Bunga</th>
                          <th className="p-2 text-right">Total</th>
                          <th className="p-2 text-right">Saldo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.jadwal.map((row) => (
                          <tr key={row.bulan} className="border-t border-border/50">
                            <td className="p-2">{row.bulan}</td>
                            <td className="p-2 text-right tabular-nums">{formatNumber(row.pokokBayar, 0)}</td>
                            <td className="p-2 text-right tabular-nums">{formatNumber(row.bungaBayar, 0)}</td>
                            <td className="p-2 text-right tabular-nums font-medium">{formatNumber(row.totalCicilan, 0)}</td>
                            <td className="p-2 text-right tabular-nums text-muted-foreground">{formatNumber(row.saldo, 0)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
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
              <CreditCard className="h-8 w-8 mx-auto mb-3 opacity-40" />
              <p>Isi data pinjaman dan klik "Simulasikan" untuk melihat proyeksi cicilan.</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Simpan Skenario Pinjaman</DialogTitle><DialogDescription>Beri nama skenario ini.</DialogDescription></DialogHeader>
          <Input value={scenarioName} onChange={e => setScenarioName(e.target.value)} placeholder="Cth: Pinjaman BRI 50jt 24 bulan" />
          <DialogFooter>
            <Button disabled={!scenarioName.trim() || createScenario.isPending} onClick={() => result && createScenario.mutate({ data: { name: scenarioName.trim(), moduleType: 'pinjaman', moduleInput: input as Record<string, unknown>, resultSnapshot: result as Record<string, unknown> } })}>
              {createScenario.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
