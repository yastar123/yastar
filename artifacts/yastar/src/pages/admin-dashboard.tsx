import { useState } from 'react';
import { useLocation } from 'wouter';
import { LogOut, Plus, Search, X } from 'lucide-react';
import {
  getGetAdminAccountQueryKey,
  useCreateAdminAccount,
  useGetAdminAccount,
  useListAdminAccounts,
  useLogoutAdmin,
  useUpdateAdminAccount,
  type Tier,
} from '@workspace/api-client-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { formatDate, TIER_LABELS } from '@/lib/format';

export default function AdminDashboardPage({ onSignedOut }: { onSignedOut: () => void }) {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: accounts = [], isLoading, refetch: refetchList } = useListAdminAccounts({
    search: search || undefined,
  });
  const { data: detail, refetch: refetchDetail } = useGetAdminAccount(selectedId ?? 0, {
    query: {
      queryKey: getGetAdminAccountQueryKey(selectedId ?? 0),
      enabled: selectedId !== null,
    },
  });

  const logout = useLogoutAdmin({
    mutation: {
      onSuccess: () => {
        onSignedOut();
        setLocation('/');
      },
    },
  });

  const updateAccount = useUpdateAdminAccount({
    mutation: {
      onSuccess: () => {
        toast({ title: 'Akun diperbarui' });
        refetchDetail();
        refetchList();
      },
      onError: () => toast({ title: 'Gagal memperbarui akun', variant: 'destructive' }),
    },
  });

  return (
    <div className="min-h-[100dvh] bg-background" data-testid="page-admin-dashboard">
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-bold tracking-tight">Yastar Admin</span>
          <Button variant="ghost" size="sm" onClick={() => logout.mutate()} data-testid="button-admin-logout">
            <LogOut className="h-4 w-4 mr-1.5" /> Keluar
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Akun Pemilik Usaha</CardTitle>
              <Button size="sm" onClick={() => setShowCreateDialog(true)} data-testid="button-create-account">
                <Plus className="h-4 w-4 mr-1.5" /> Buat Akun
              </Button>
            </div>
            <div className="relative mt-2">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Cari berdasarkan email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="input-admin-search"
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground text-sm">Memuat...</p>
            ) : (
              <Table data-testid="table-admin-accounts">
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Paket</TableHead>
                    <TableHead>Skenario</TableHead>
                    <TableHead>Kadaluarsa</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((account) => (
                    <TableRow
                      key={account.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedId(account.id)}
                      data-testid={`row-admin-account-${account.id}`}
                    >
                      <TableCell>{account.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{TIER_LABELS[account.tier]}</Badge>
                      </TableCell>
                      <TableCell>
                        {account.scenarioCount}
                        {account.scenarioLimit !== null ? ` / ${account.scenarioLimit}` : ''}
                      </TableCell>
                      <TableCell>{formatDate(account.packageExpiresAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Detail Akun</CardTitle>
          </CardHeader>
          <CardContent>
            {!detail ? (
              <p className="text-sm text-muted-foreground">Pilih akun dari daftar untuk melihat detail.</p>
            ) : (
              <div className="flex flex-col gap-4" data-testid="panel-account-detail">
                <div>
                  <p className="font-medium">{detail.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Terdaftar {formatDate(detail.createdAt)}
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">Paket</Label>
                  <Select
                    value={detail.tier}
                    onValueChange={(v) =>
                      updateAccount.mutate({ id: detail.id, data: { tier: v as Tier } })
                    }
                  >
                    <SelectTrigger data-testid="select-admin-tier">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TIER_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">Batas Skenario (kosongkan = tanpa batas)</Label>
                  <Input
                    type="number"
                    min={0}
                    defaultValue={detail.scenarioLimit ?? ''}
                    placeholder="Tanpa batas"
                    onBlur={(e) =>
                      updateAccount.mutate({
                        id: detail.id,
                        data: {
                          scenarioLimit: e.target.value === '' ? null : Number(e.target.value),
                        },
                      })
                    }
                    data-testid="input-admin-scenario-limit"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">Tanggal Kadaluarsa Paket</Label>
                  <Input
                    type="date"
                    defaultValue={detail.packageExpiresAt?.slice(0, 10) ?? ''}
                    onBlur={(e) =>
                      updateAccount.mutate({
                        id: detail.id,
                        data: {
                          packageExpiresAt: e.target.value
                            ? new Date(e.target.value).toISOString()
                            : null,
                        },
                      })
                    }
                    data-testid="input-admin-expires-at"
                  />
                </div>

                <div>
                  <Label className="text-xs mb-2 block">Riwayat Perubahan</Label>
                  <div className="flex flex-col gap-2 max-h-52 overflow-y-auto">
                    {detail.history.length === 0 && (
                      <p className="text-xs text-muted-foreground">Belum ada riwayat.</p>
                    )}
                    {detail.history.map((entry) => (
                      <div
                        key={entry.id}
                        className="text-xs border border-border rounded-md p-2"
                        data-testid={`row-history-${entry.id}`}
                      >
                        <p>
                          {TIER_LABELS[entry.previousTier]} → {TIER_LABELS[entry.newTier]}
                        </p>
                        {entry.note && <p className="text-muted-foreground mt-0.5">{entry.note}</p>}
                        <p className="text-muted-foreground mt-0.5">{formatDate(entry.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <CreateAccountDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreated={(id) => {
          refetchList();
          setSelectedId(id);
          setShowCreateDialog(false);
        }}
      />
    </div>
  );
}

function CreateAccountDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: (id: number) => void;
}) {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [tier, setTier] = useState<Tier>('free');
  const [scenarioLimit, setScenarioLimit] = useState<string>('2');
  const [expiresAt, setExpiresAt] = useState('');

  const createAccount = useCreateAdminAccount({
    mutation: {
      onSuccess: (data) => {
        toast({ title: `Akun ${data.email} berhasil dibuat` });
        onCreated(data.id);
        // Reset form
        setEmail('');
        setBusinessName('');
        setTier('free');
        setScenarioLimit('2');
        setExpiresAt('');
      },
      onError: (err: unknown) => {
        const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
          ?? 'Gagal membuat akun';
        toast({ title: msg, variant: 'destructive' });
      },
    },
  });

  function handleSubmit() {
    if (!email.trim()) return;
    createAccount.mutate({
      data: {
        email: email.trim(),
        businessName: businessName.trim() || null,
        tier,
        scenarioLimit: scenarioLimit === '' ? null : Number(scenarioLimit),
        exportEnabled: tier !== 'free',
        benchmarkAccess: tier === 'professional',
        packageExpiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        packageStartedAt: expiresAt ? new Date().toISOString() : null,
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="dialog-create-account">
        <DialogHeader>
          <DialogTitle>Buat Akun Pelanggan Baru</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Email <span className="text-destructive">*</span></Label>
            <Input
              type="email"
              placeholder="owner@salon.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              data-testid="input-create-email"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Nama Usaha</Label>
            <Input
              placeholder="Salon Cantik Jakarta"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              data-testid="input-create-business-name"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Paket</Label>
            <Select value={tier} onValueChange={(v) => setTier(v as Tier)}>
              <SelectTrigger data-testid="select-create-tier">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TIER_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Batas Skenario (kosongkan = tanpa batas)</Label>
            <Input
              type="number"
              min={0}
              value={scenarioLimit}
              onChange={(e) => setScenarioLimit(e.target.value)}
              placeholder="Tanpa batas"
              data-testid="input-create-scenario-limit"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Tanggal Kadaluarsa Paket</Label>
            <Input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              data-testid="input-create-expires-at"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-1.5" /> Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!email.trim() || createAccount.isPending}
            data-testid="button-confirm-create-account"
          >
            {createAccount.isPending ? 'Menyimpan...' : 'Buat Akun'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
