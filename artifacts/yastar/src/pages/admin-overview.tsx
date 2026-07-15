import { useListAdminAccounts } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, Star, Zap } from 'lucide-react';
import { TIER_LABELS } from '@/lib/format';
import type { Tier } from '@workspace/api-client-react';

const TIER_ORDER: Tier[] = ['professional', 'starter', 'free'];

export default function AdminOverviewPage() {
  const { data: accounts = [], isLoading } = useListAdminAccounts({});

  const total = accounts.length;
  const byTier = TIER_ORDER.reduce<Record<string, number>>(
    (acc, t) => ({ ...acc, [t]: accounts.filter((a) => a.tier === t).length }),
    {},
  );

  const stats = [
    {
      label: 'Total Akun',
      value: isLoading ? '—' : total,
      icon: Users,
      sub: 'pemilik usaha terdaftar',
    },
    {
      label: 'Professional',
      value: isLoading ? '—' : byTier['professional'] ?? 0,
      icon: Star,
      sub: 'akun tier tertinggi',
    },
    {
      label: 'Starter',
      value: isLoading ? '—' : byTier['starter'] ?? 0,
      icon: Zap,
      sub: 'akun tier menengah',
    },
    {
      label: 'Gratis',
      value: isLoading ? '—' : byTier['free'] ?? 0,
      icon: TrendingUp,
      sub: 'akun tier gratis',
    },
  ];

  return (
    <div className="p-6 flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Ringkasan status akun Yastar.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, sub }) => (
          <Card key={label}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Distribusi tier */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Distribusi Tier</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Memuat...</p>
          ) : total === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada akun terdaftar.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {TIER_ORDER.map((tier) => {
                const count = byTier[tier] ?? 0;
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={tier} className="flex items-center gap-3">
                    <Badge variant="outline" className="w-28 justify-center shrink-0">
                      {TIER_LABELS[tier]}
                    </Badge>
                    <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-14 text-right shrink-0">
                      {count} ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
