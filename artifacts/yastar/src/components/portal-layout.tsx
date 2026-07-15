import { useState } from 'react';
import { useLocation } from 'wouter';
import {
  LayoutDashboard,
  Calculator,
  BarChart2,
  TrendingUp,
  Tag,
  Receipt,
  Building2,
  CreditCard,
  Layers,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOwnerAuth } from '@/lib/ownerAuth';
import { TIER_LABELS } from '@/lib/format';
import type { Account } from '@workspace/api-client-react';
import { cn } from '@/lib/utils';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  section?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'beranda',
    label: 'Beranda',
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  // --- Simulasi ---
  {
    id: 'target-mundur',
    label: 'Target Profit → Klien',
    icon: <Calculator className="h-4 w-4" />,
    section: 'Simulasi Bisnis',
  },
  {
    id: 'hpp',
    label: 'Hitung HPP',
    icon: <BarChart2 className="h-4 w-4" />,
  },
  {
    id: 'bep-usaha',
    label: 'Titik Impas Usaha',
    icon: <TrendingUp className="h-4 w-4" />,
    badge: 'Starter+',
  },
  {
    id: 'harga-jual',
    label: 'Uji Harga Jual',
    icon: <Tag className="h-4 w-4" />,
    badge: 'Starter+',
  },
  {
    id: 'pajak',
    label: 'Estimasi Pajak UMKM',
    icon: <Receipt className="h-4 w-4" />,
    badge: 'Starter+',
  },
  {
    id: 'ekspansi',
    label: 'Kelayakan Cabang Baru',
    icon: <Building2 className="h-4 w-4" />,
    badge: 'Pro',
  },
  {
    id: 'pinjaman',
    label: 'Simulasi Pinjaman',
    icon: <CreditCard className="h-4 w-4" />,
    badge: 'Pro',
  },
  // --- Akun ---
  {
    id: 'skenario',
    label: 'Skenario Tersimpan',
    icon: <Layers className="h-4 w-4" />,
    section: 'Akun',
  },
];

interface PortalLayoutProps {
  activeModule: string;
  account?: Account;
  children: React.ReactNode;
}

export default function PortalLayout({ activeModule, account, children }: PortalLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { session, logout } = useOwnerAuth();
  const [, navigate] = useLocation();

  function handleNav(id: string) {
    navigate(`/user-portal/${id}`);
    setSidebarOpen(false);
  }

  const usageLabel = account
    ? account.scenarioLimit === null
      ? `${account.scenarioCount} skenario`
      : `${account.scenarioCount} / ${account.scenarioLimit} skenario`
    : null;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-border">
        <img src={`${basePath}/logo.svg`} alt="Yastar" className="h-7 w-7 rounded-lg" />
        <span className="font-bold tracking-tight text-sm">Yastar</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {NAV_ITEMS.map((item, idx) => {
          const isActive = activeModule === item.id;
          const prevItem = NAV_ITEMS[idx - 1];
          const showSection = item.section && item.section !== prevItem?.section;

          return (
            <div key={item.id}>
              {showSection && (
                <p className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {item.section}
                </p>
              )}
              <button
                onClick={() => handleNav(item.id)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors text-left',
                  isActive
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-foreground/70 hover:bg-accent hover:text-foreground',
                )}
                data-testid={`nav-${item.id}`}
              >
                <span className="shrink-0">{item.icon}</span>
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge && !isActive && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="h-3.5 w-3.5 ml-auto shrink-0 opacity-70" />}
              </button>
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2 mb-2 px-1">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{session?.businessName ?? session?.email}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {account && (
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4">
                  {TIER_LABELS[account.tier]}
                </Badge>
              )}
              {usageLabel && (
                <span className="text-[10px] text-muted-foreground">{usageLabel}</span>
              )}
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-foreground text-xs h-8"
          onClick={() => logout()}
          data-testid="button-sign-out"
        >
          <LogOut className="h-3.5 w-3.5 mr-2" /> Keluar
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-[100dvh] bg-background overflow-hidden" data-testid="portal-layout">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-border bg-card">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative z-50 flex flex-col w-64 bg-card border-r border-border h-full">
            <button
              className="absolute top-3 right-3 p-1.5 rounded-md hover:bg-accent"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-card shrink-0">
          <button
            className="p-1.5 rounded-md hover:bg-accent"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <img src={`${basePath}/logo.svg`} alt="Yastar" className="h-6 w-6 rounded" />
          <span className="font-bold text-sm tracking-tight flex-1">Yastar</span>
          {account && (
            <Badge variant="outline" className="text-xs">
              {TIER_LABELS[account.tier]}
            </Badge>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
