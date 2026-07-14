import { Plus, Trash2 } from 'lucide-react';
import type { CommissionConfig, CommissionModel } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { COMMISSION_MODEL_LABELS } from '@/lib/format';

interface CommissionConfigInputProps {
  model: CommissionModel;
  config: CommissionConfig;
  onModelChange: (model: CommissionModel) => void;
  onConfigChange: (config: CommissionConfig) => void;
}

export function CommissionConfigInput({
  model,
  config,
  onModelChange,
  onConfigChange,
}: CommissionConfigInputProps) {
  const tiers = config.tiers ?? [];

  function updateTier(index: number, patch: Partial<{ minClients: number; percent: number }>) {
    const next = tiers.map((t, i) => (i === index ? { ...t, ...patch } : t));
    onConfigChange({ ...config, tiers: next });
  }

  function addTier() {
    onConfigChange({
      ...config,
      tiers: [...tiers, { minClients: 0, percent: 0 }],
    });
  }

  function removeTier(index: number) {
    onConfigChange({ ...config, tiers: tiers.filter((_, i) => i !== index) });
  }

  return (
    <div className="flex flex-col gap-3" data-testid="commission-config-input">
      <div className="flex flex-col gap-1.5">
        <Label>Model Komisi Karyawan</Label>
        <Select value={model} onValueChange={(v) => onModelChange(v as CommissionModel)}>
          <SelectTrigger data-testid="select-commission-model">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(COMMISSION_MODEL_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {model === 'flat' && (
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">Persentase komisi (%)</Label>
          <Input
            type="number"
            min={0}
            max={100}
            value={config.flatPercent ?? 0}
            onChange={(e) => onConfigChange({ ...config, flatPercent: Number(e.target.value) })}
            data-testid="input-flat-percent"
          />
        </div>
      )}

      {model === 'base_plus_commission' && (
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Gaji pokok / bulan (Rp)</Label>
            <Input
              type="number"
              min={0}
              value={config.baseSalary ?? 0}
              onChange={(e) => onConfigChange({ ...config, baseSalary: Number(e.target.value) })}
              data-testid="input-base-salary"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Komisi tambahan (%)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={config.baseCommissionPercent ?? 0}
              onChange={(e) =>
                onConfigChange({ ...config, baseCommissionPercent: Number(e.target.value) })
              }
              data-testid="input-base-commission-percent"
            />
          </div>
        </div>
      )}

      {model === 'tiered' && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Tingkatan komisi berdasarkan jumlah klien</Label>
            <Button type="button" variant="outline" size="sm" onClick={addTier} data-testid="button-add-tier">
              <Plus className="h-4 w-4 mr-1" /> Tambah Tingkat
            </Button>
          </div>
          {tiers.map((tier, index) => (
            <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end" data-testid={`row-tier-${index}`}>
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground">Min. klien/bulan</Label>
                <Input
                  type="number"
                  min={0}
                  value={tier.minClients}
                  onChange={(e) => updateTier(index, { minClients: Number(e.target.value) })}
                  data-testid={`input-tier-min-${index}`}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground">Komisi (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={tier.percent}
                  onChange={(e) => updateTier(index, { percent: Number(e.target.value) })}
                  data-testid={`input-tier-percent-${index}`}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={tiers.length <= 1}
                onClick={() => removeTier(index)}
                data-testid={`button-remove-tier-${index}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
