import { Plus, Trash2 } from 'lucide-react';
import type { ServiceItem } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ServiceListInputProps {
  services: ServiceItem[];
  onChange: (services: ServiceItem[]) => void;
}

export function ServiceListInput({ services, onChange }: ServiceListInputProps) {
  function update(index: number, patch: Partial<ServiceItem>) {
    const next = services.map((s, i) => (i === index ? { ...s, ...patch } : s));
    onChange(next);
  }

  function addService() {
    onChange([...services, { name: '', price: 0, durationMinutes: 30 }]);
  }

  function removeService(index: number) {
    onChange(services.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-3" data-testid="service-list-input">
      <div className="flex items-center justify-between">
        <Label>Layanan / Jasa</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addService}
          data-testid="button-add-service"
        >
          <Plus className="h-4 w-4 mr-1" /> Tambah Layanan
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        {services.map((service, index) => (
          <div
            key={index}
            className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-end rounded-lg border border-border p-3 bg-card"
            data-testid={`row-service-${index}`}
          >
            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground">Nama layanan</Label>
              <Input
                value={service.name}
                placeholder="Cth: Potong rambut"
                onChange={(e) => update(index, { name: e.target.value })}
                data-testid={`input-service-name-${index}`}
              />
            </div>
            <div className="flex flex-col gap-1 w-32">
              <Label className="text-xs text-muted-foreground">Harga (Rp)</Label>
              <Input
                type="number"
                min={0}
                value={service.price}
                onChange={(e) => update(index, { price: Number(e.target.value) })}
                data-testid={`input-service-price-${index}`}
              />
            </div>
            <div className="flex flex-col gap-1 w-28">
              <Label className="text-xs text-muted-foreground">Durasi (mnt)</Label>
              <Input
                type="number"
                min={1}
                value={service.durationMinutes}
                onChange={(e) =>
                  update(index, { durationMinutes: Number(e.target.value) })
                }
                data-testid={`input-service-duration-${index}`}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={services.length <= 1}
              onClick={() => removeService(index)}
              data-testid={`button-remove-service-${index}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
