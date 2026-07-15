import { useState } from 'react';
import { BarChart2, Plus, Save, Sparkles, Trash2 } from 'lucide-react';
import type { HppInput, HppResult, RawMaterialItem } from '@workspace/api-client-react';
import { useCalculateHpp, useCreateModuleScenario, useCreateCostItem } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CurrencyInput } from '@/components/currency-input';
import { InsightList } from '@/components/insight-list';
import { useToast } from '@/hooks/use-toast';
import { formatIDR, formatNumber } from '@/lib/format';

interface Props { canSave: boolean; onScenarioSaved: () => void; }

const DEFAULT_PRODUK: HppInput = {
  mode: 'produk',
  nama: '',
  sellingPrice: null,
  rawMaterials: [{ name: '', qty: 1, unitPrice: 0 }],
  directLaborCostPerUnit: 0,
  monthlyOverhead: 0,
  estimatedUnitsPerMonth: 100,
  packagingCostPerUnit: 0,
};

const DEFAULT_JASA: HppInput = {
  mode: 'jasa',
  nama: '',
  sellingPrice: null,
  consumablesPerSession: [{ name: '', qty: 1, unitPrice: 0 }],
  monthlyFixedCosts: 0,
  estimatedSessionsPerMonth: 80,
  therapistCommissionPerSession: 0,
};

function RawMaterialRow({
  item,
  onChange,
  onDelete,
}: {
  item: RawMaterialItem;
  onChange: (v: RawMaterialItem) => void;
  onDelete: () => void;
}) {
  return (
    <div className="grid grid-cols-[1fr_80px_140px_36px] gap-2 items-end">
      <div className="flex flex-col gap-1">
        <Label className="text-xs">Nama</Label>
        <Input value={item.name} onChange={e => onChange({ ...item, name: e.target.value })} placeholder="Cth: Shampoo" />
      </div>
      <div className="flex flex-col gap-1">
        <Label className="text-xs">Qty</Label>
        <Input type="number" min={0} step={0.01} value={item.qty} onChange={e => onChange({ ...item, qty: Number(e.target.value) })} />
      </div>
      <div className="flex flex-col gap-1">
        <Label className="text-xs">Harga Satuan (Rp)</Label>
        <CurrencyInput value={item.unitPrice} onValueChange={v => onChange({ ...item, unitPrice: v })} />
      </div>
      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive mt-5" onClick={onDelete}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default function HppCalculatorPage({ canSave, onScenarioSaved }: Props) {
  const [mode, setMode] = useState<'produk' | 'jasa'>('jasa');
  const [inputProduk, setInputProduk] = useState<HppInput>(DEFAULT_PRODUK);
  const [inputJasa, setInputJasa] = useState<HppInput>(DEFAULT_JASA);
  const [result, setResult] = useState<HppResult | null>(null);
  const [saveScenarioOpen, setSaveScenarioOpen] = useState(false);
  const [saveCostItemOpen, setSaveCostItemOpen] = useState(false);
  const [scenarioName, setScenarioName] = useState('');
  const { toast } = useToast();

  const input = mode === 'produk' ? inputProduk : inputJasa;
  const setInput = mode === 'produk'
    ? (v: HppInput) => setInputProduk(v)
    : (v: HppInput) => setInputJasa(v);

  const calculate = useCalculateHpp({
    mutation: {
      onSuccess: (data) => setResult(data),
      onError: () => toast({ title: 'Perhitungan gagal', variant: 'destructive' }),
    },
  });

  const createScenario = useCreateModuleScenario({
    mutation: {
      onSuccess: () => {
        setSaveScenarioOpen(false);
        setScenarioName('');
        toast({ title: 'Skenario disimpan' });
        onScenarioSaved();
      },
      onError: () => toast({ title: 'Gagal menyimpan skenario', variant: 'destructive' }),
    },
  });

  const createCostItem = useCreateCostItem({
    mutation: {
      onSuccess: () => {
        setSaveCostItemOpen(false);
        toast({ title: 'HPP tersimpan ke daftar cost items', description: 'Kamu bisa memilihnya di modul lain.' });
      },
      onError: () => toast({ title: 'Gagal menyimpan cost item', variant: 'destructive' }),
    },
  });

  function patch(fields: Partial<HppInput>) {
    setInput({ ...input, ...fields } as HppInput);
  }

  function updateMaterial(idx: number, val: RawMaterialItem) {
    if (mode === 'produk') {
      const mats = [...(input.rawMaterials ?? [])];
      mats[idx] = val;
      patch({ rawMaterials: mats });
    } else {
      const mats = [...(input.consumablesPerSession ?? [])];
      mats[idx] = val;
      patch({ consumablesPerSession: mats });
    }
  }

  function deleteMaterial(idx: number) {
    if (mode === 'produk') {
      patch({ rawMaterials: (input.rawMaterials ?? []).filter((_, i) => i !== idx) });
    } else {
      patch({ consumablesPerSession: (input.consumablesPerSession ?? []).filter((_, i) => i !== idx) });
    }
  }

  function addMaterial() {
    const blank: RawMaterialItem = { name: '', qty: 1, unitPrice: 0 };
    if (mode === 'produk') {
      patch({ rawMaterials: [...(input.rawMaterials ?? []), blank] });
    } else {
      patch({ consumablesPerSession: [...(input.consumablesPerSession ?? []), blank] });
    }
  }

  function runCalculation() {
    calculate.mutate({ data: input });
  }

  const materials = mode === 'produk' ? input.rawMaterials ?? [] : input.consumablesPerSession ?? [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6" data-testid="page-hpp-calculator">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-primary" />
            Hitung HPP
          </CardTitle>
          <CardDescription>
            Hitung Harga Pokok Produksi/Layanan untuk mengetahui margin dan markup yang sebenarnya.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <Tabs value={mode} onValueChange={(v) => { setMode(v as 'produk' | 'jasa'); setResult(null); }}>
            <TabsList className="w-full">
              <TabsTrigger value="jasa" className="flex-1">Mode Jasa / Servis</TabsTrigger>
              <TabsTrigger value="produk" className="flex-1">Mode Produk / Retail</TabsTrigger>
            </TabsList>

            <TabsContent value={mode} className="flex flex-col gap-4 mt-4">
              <div className="flex flex-col gap-1.5">
                <Label>Nama {mode === 'produk' ? 'Produk' : 'Layanan'}</Label>
                <Input
                  value={input.nama}
                  onChange={e => patch({ nama: e.target.value })}
                  placeholder={mode === 'produk' ? 'Cth: Kondisioner Rambut 200ml' : 'Cth: Creambath Premium'}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Harga Jual (Rp) <span className="text-muted-foreground text-xs">— opsional, untuk hitung margin</span></Label>
                <CurrencyInput
                  value={input.sellingPrice ?? 0}
                  onValueChange={v => patch({ sellingPrice: v > 0 ? v : null })}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm">{mode === 'produk' ? 'Bahan Baku' : 'Bahan Habis Pakai / Sesi'}</Label>
                  <Button variant="outline" size="sm" onClick={addMaterial}>
                    <Plus className="h-3.5 w-3.5 mr-1" /> Tambah
                  </Button>
                </div>
                <div className="flex flex-col gap-3">
                  {materials.map((m, i) => (
                    <RawMaterialRow key={i} item={m} onChange={v => updateMaterial(i, v)} onDelete={() => deleteMaterial(i)} />
                  ))}
                  {materials.length === 0 && (
                    <p className="text-xs text-muted-foreground">Belum ada bahan. Klik "Tambah" untuk menambahkan.</p>
                  )}
                </div>
              </div>

              {mode === 'produk' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm">Biaya Tenaga Kerja Langsung / Unit (Rp)</Label>
                    <CurrencyInput value={input.directLaborCostPerUnit ?? 0} onValueChange={v => patch({ directLaborCostPerUnit: v })} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm">Biaya Kemasan / Unit (Rp)</Label>
                    <CurrencyInput value={input.packagingCostPerUnit ?? 0} onValueChange={v => patch({ packagingCostPerUnit: v })} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm">Overhead Produksi / Bulan (Rp)</Label>
                    <CurrencyInput value={input.monthlyOverhead ?? 0} onValueChange={v => patch({ monthlyOverhead: v })} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm">Estimasi Unit Diproduksi / Bulan</Label>
                    <Input type="number" min={1} value={input.estimatedUnitsPerMonth ?? 1} onChange={e => patch({ estimatedUnitsPerMonth: Number(e.target.value) })} />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm">Biaya Tetap Bulanan (Rp)</Label>
                    <CurrencyInput value={input.monthlyFixedCosts ?? 0} onValueChange={v => patch({ monthlyFixedCosts: v })} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm">Estimasi Sesi / Bulan</Label>
                    <Input type="number" min={1} value={input.estimatedSessionsPerMonth ?? 1} onChange={e => patch({ estimatedSessionsPerMonth: Number(e.target.value) })} />
                  </div>
                  <div className="flex flex-col gap-1.5 col-span-2">
                    <Label className="text-sm">Komisi / Gaji Terapis per Sesi (Rp)</Label>
                    <CurrencyInput value={input.therapistCommissionPerSession ?? 0} onValueChange={v => patch({ therapistCommissionPerSession: v })} />
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <Button onClick={runCalculation} disabled={calculate.isPending} className="w-full">
            <Sparkles className="h-4 w-4 mr-2" />
            {calculate.isPending ? 'Menghitung...' : 'Hitung HPP'}
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        {result ? (
          <>
            <Card className="border-primary/30">
              <CardHeader className="pb-3">
                <CardTitle>Hasil HPP — {input.nama || 'Tanpa Nama'}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 bg-primary/5 rounded-lg p-4 text-center">
                    <span className="text-xs text-muted-foreground block">HPP per {mode === 'produk' ? 'unit' : 'sesi'}</span>
                    <span className="text-3xl font-bold text-primary">{formatIDR(result.hpp)}</span>
                  </div>
                  {result.sellingPrice !== null && result.sellingPrice! > 0 && (
                    <>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground">Harga Jual</span>
                        <span className="text-lg font-semibold">{formatIDR(result.sellingPrice!)}</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground">Margin</span>
                        <span className="text-lg font-semibold">{result.margin !== null ? `${formatNumber(result.margin, 1)}%` : '—'}</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground">Markup dari HPP</span>
                        <span className="text-lg font-semibold">{result.markup !== null ? `${formatNumber(result.markup, 1)}%` : '—'}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="border-t border-border pt-3">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Rincian Biaya</p>
                  <div className="flex flex-col gap-1">
                    {Object.entries(result.breakdown).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-sm">
                        <span className="text-muted-foreground capitalize">{k.replace(/_/g, ' ')}</span>
                        <span>{formatIDR(v as number)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <InsightList insights={result.insights} />

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setSaveCostItemOpen(true)}>
                <Save className="h-4 w-4 mr-2" /> Simpan ke Cost Items
              </Button>
              <Button variant="outline" className="flex-1" disabled={!canSave} onClick={() => setSaveScenarioOpen(true)}>
                <Save className="h-4 w-4 mr-2" /> Simpan Skenario
              </Button>
            </div>
            {!canSave && (
              <p className="text-xs text-muted-foreground">Batas skenario tersimpan pada paketmu sudah tercapai.</p>
            )}
          </>
        ) : (
          <Card className="h-full flex items-center justify-center border-dashed">
            <CardContent className="text-center py-16 text-muted-foreground">
              <BarChart2 className="h-8 w-8 mx-auto mb-3 opacity-40" />
              <p>Isi data di sebelah kiri dan klik "Hitung HPP" untuk melihat hasilnya.</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={saveCostItemOpen} onOpenChange={setSaveCostItemOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Simpan ke Cost Items</DialogTitle>
            <DialogDescription>
              HPP ini akan disimpan dan bisa dipilih di modul BEP Usaha, Uji Harga Jual, dan Ekspansi tanpa perlu input ulang.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveCostItemOpen(false)}>Batal</Button>
            <Button
              disabled={createCostItem.isPending}
              onClick={() => result && createCostItem.mutate({
                data: { nama: input.nama || 'HPP tanpa nama', mode: mode, hppInput: input as Record<string, unknown>, hppResult: result as Record<string, unknown> },
              })}
            >
              {createCostItem.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={saveScenarioOpen} onOpenChange={setSaveScenarioOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Simpan Skenario HPP</DialogTitle>
            <DialogDescription>Beri nama skenario ini agar mudah ditemukan kembali.</DialogDescription>
          </DialogHeader>
          <Input value={scenarioName} onChange={e => setScenarioName(e.target.value)} placeholder="Cth: HPP Creambath Premium" />
          <DialogFooter>
            <Button
              disabled={!scenarioName.trim() || createScenario.isPending}
              onClick={() => result && createScenario.mutate({
                data: { name: scenarioName.trim(), moduleType: 'hpp', moduleInput: input as Record<string, unknown>, resultSnapshot: result as Record<string, unknown> },
              })}
            >
              {createScenario.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
