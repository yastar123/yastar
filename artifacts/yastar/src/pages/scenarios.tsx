import { useState } from 'react';
import { CalendarClock, Layers, Trash2 } from 'lucide-react';
import { useDeleteScenario, useListScenarios } from '@workspace/api-client-react';
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
import { useToast } from '@/hooks/use-toast';
import { BUSINESS_TYPE_LABELS, formatDate, formatIDR, formatNumber } from '@/lib/format';

export default function ScenariosPage() {
  const { data: scenarios = [], isLoading } = useListScenarios();
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const { toast } = useToast();

  const deleteScenario = useDeleteScenario({
    mutation: {
      onSuccess: () => {
        setPendingDeleteId(null);
        toast({ title: 'Skenario dihapus' });
      },
      onError: () =>
        toast({
          title: 'Gagal menghapus skenario',
          variant: 'destructive',
        }),
    },
  });

  if (isLoading) {
    return <p className="text-muted-foreground" data-testid="text-scenarios-loading">Memuat skenario...</p>;
  }

  if (scenarios.length === 0) {
    return (
      <Card className="border-dashed" data-testid="card-scenarios-empty">
        <CardContent className="text-center py-16 text-muted-foreground">
          <Layers className="h-8 w-8 mx-auto mb-3 opacity-40" />
          <p>Belum ada skenario tersimpan. Hitung target di tab Kalkulator lalu simpan.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="page-scenarios">
      {scenarios.map((scenario) => (
        <Card key={scenario.id} data-testid={`card-scenario-${scenario.id}`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle className="text-base">{scenario.name}</CardTitle>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <CalendarClock className="h-3 w-3" /> {formatDate(scenario.createdAt)}
                </p>
              </div>
              <Badge variant="outline">{BUSINESS_TYPE_LABELS[scenario.businessType]}</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-xs text-muted-foreground block">Target laba</span>
                <span className="font-medium">{formatIDR(scenario.targetProfit)}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Klien dibutuhkan</span>
                <span className="font-medium">
                  {formatNumber(scenario.resultSnapshot.clientsNeededTotal, 0)} / bulan
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Utilisasi</span>
                <span className="font-medium">
                  {formatNumber(scenario.resultSnapshot.utilizationPercent, 0)}%
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Status</span>
                <Badge variant={scenario.resultSnapshot.isRealistic ? 'default' : 'destructive'}>
                  {scenario.resultSnapshot.isRealistic ? 'Realistis' : 'Perlu ditinjau'}
                </Badge>
              </div>
            </div>
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

      <Dialog open={pendingDeleteId !== null} onOpenChange={(open) => !open && setPendingDeleteId(null)}>
        <DialogContent data-testid="dialog-delete-scenario">
          <DialogHeader>
            <DialogTitle>Hapus skenario ini?</DialogTitle>
            <DialogDescription>Tindakan ini tidak dapat dibatalkan.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDeleteId(null)}>
              Batal
            </Button>
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
