import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useListAdminAccounts } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Star, Zap, TrendingUp, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { TIER_LABELS } from '@/lib/format';
import type { Tier } from '@workspace/api-client-react';

const TIER_ORDER: Tier[] = ['professional', 'starter', 'free'];

const TIER_COLORS: Record<Tier, string> = {
  professional: '#2d6a4f',
  starter:      '#52b788',
  free:         '#b7e4c7',
};

// Custom label for pie slices (only when there's enough space)
function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: {
  cx: number; cy: number; midAngle: number;
  innerRadius: number; outerRadius: number; percent: number;
}) {
  if (percent < 0.08) return null;
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export default function AdminOverviewPage() {
  const { data: accounts = [], isLoading } = useListAdminAccounts({});

  const total = accounts.length;
  const now = new Date();

  // Tier counts
  const byTier = TIER_ORDER.reduce<Record<string, number>>(
    (acc, t) => ({ ...acc, [t]: accounts.filter((a) => a.tier === t).length }),
    {},
  );

  // Package status
  const active   = accounts.filter((a) => a.packageExpiresAt && new Date(a.packageExpiresAt) > now).length;
  const expiring = accounts.filter((a) => {
    if (!a.packageExpiresAt) return false;
    const exp = new Date(a.packageExpiresAt);
    const diff = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff > 0 && diff <= 30;
  }).length;
  const expired  = accounts.filter((a) => a.packageExpiresAt && new Date(a.packageExpiresAt) <= now).length;
  const noPackage = accounts.filter((a) => !a.packageExpiresAt).length;

  // Pie chart data
  const pieData = TIER_ORDER
    .filter((t) => (byTier[t] ?? 0) > 0)
    .map((t) => ({ name: TIER_LABELS[t], value: byTier[t] ?? 0, color: TIER_COLORS[t] }));

  // Bar chart: scenario usage per tier (avg scenarioCount, avg limit fill %)
  const barData = TIER_ORDER
    .filter((t) => (byTier[t] ?? 0) > 0)
    .map((t) => {
      const tierAccounts = accounts.filter((a) => a.tier === t);
      const avgCount = tierAccounts.length
        ? Math.round(tierAccounts.reduce((s, a) => s + a.scenarioCount, 0) / tierAccounts.length * 10) / 10
        : 0;
      const withLimit = tierAccounts.filter((a) => a.scenarioLimit !== null);
      const avgFill = withLimit.length
        ? Math.round(withLimit.reduce((s, a) => s + (a.scenarioCount / (a.scenarioLimit ?? 1)) * 100, 0) / withLimit.length)
        : null;
      return { tier: TIER_LABELS[t], avgCount, avgFill, color: TIER_COLORS[t] };
    });

  const stats = [
    { label: 'Total Akun',     value: total,  icon: Users,        sub: 'terdaftar' },
    { label: 'Professional',   value: byTier['professional'] ?? 0, icon: Star,   sub: 'tier tertinggi' },
    { label: 'Starter',        value: byTier['starter'] ?? 0,      icon: Zap,    sub: 'tier menengah' },
    { label: 'Gratis',         value: byTier['free'] ?? 0,         icon: TrendingUp, sub: 'tier gratis' },
  ];

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Ringkasan status akun Yastar.</p>
      </div>

      {/* Stats cards */}
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

      {/* Charts row */}
      {total > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Pie: Distribusi Tier */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Distribusi Tier</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={82}
                      paddingAngle={3}
                      dataKey="value"
                      labelLine={false}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      label={PieLabel as any}
                    >
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`${v} akun`, '']} />
                    <Legend
                      formatter={(value) => (
                        <span className="text-xs text-foreground">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Bar: Rata-rata skenario tersimpan per tier */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Rata-rata Skenario Tersimpan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} barSize={36} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="tier"
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: 'hsl(var(--muted))' }}
                      formatter={(v: number) => [`${v} skenario`, 'Rata-rata']}
                    />
                    <Bar dataKey="avgCount" radius={[4, 4, 0, 0]}>
                      {barData.map((entry) => (
                        <Cell key={entry.tier} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Package status row */}
      {total > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Status Paket</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-2xl font-bold">{active}</p>
                  <p className="text-xs text-muted-foreground">Aktif</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-amber-500 shrink-0" />
                <div>
                  <p className="text-2xl font-bold">{expiring}</p>
                  <p className="text-xs text-muted-foreground">Habis dalam 30 hari</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                <div>
                  <p className="text-2xl font-bold">{expired}</p>
                  <p className="text-xs text-muted-foreground">Sudah kadaluarsa</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-2xl font-bold">{noPackage}</p>
                  <p className="text-xs text-muted-foreground">Tanpa paket</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {total === 0 && (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-sm text-muted-foreground">Belum ada akun terdaftar.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
