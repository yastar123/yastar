import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import type { Insight } from '@workspace/api-client-react';
import { cn } from '@/lib/utils';

const SEVERITY_STYLES: Record<
  Insight['severity'],
  { icon: typeof Info; classes: string }
> = {
  info: { icon: Info, classes: 'bg-secondary text-secondary-foreground' },
  success: {
    icon: CheckCircle2,
    classes: 'bg-primary/10 text-primary border-primary/20',
  },
  warning: {
    icon: AlertTriangle,
    classes: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800',
  },
  danger: {
    icon: XCircle,
    classes: 'bg-destructive/10 text-destructive border-destructive/30',
  },
};

export function InsightList({ insights }: { insights: Insight[] }) {
  if (!insights.length) return null;

  return (
    <div className="flex flex-col gap-2" data-testid="list-insights">
      {insights.map((insight, index) => {
        const style = SEVERITY_STYLES[insight.severity];
        const Icon = style.icon;
        return (
          <div
            key={`${insight.code}-${index}`}
            className={cn(
              'flex items-start gap-3 rounded-lg border px-3 py-2.5 text-sm',
              style.classes,
            )}
            data-testid={`insight-${insight.code}`}
          >
            <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <p className="leading-relaxed">{insight.message}</p>
          </div>
        );
      })}
    </div>
  );
}
