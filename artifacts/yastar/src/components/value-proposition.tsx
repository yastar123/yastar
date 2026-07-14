import { Check, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const OLD_WAY = [
  'Tebak-tebak harga & jumlah klien, lalu berharap untung',
  'Baru sadar rugi setelah tutup buku akhir bulan',
  'Nambah karyawan tanpa tahu dampaknya ke laba',
];

const YASTAR_WAY = [
  'Tentukan laba yang kamu mau duluan, sisanya dihitung otomatis',
  'Tahu dari awal berapa klien & utilisasi yang realistis dicapai',
  'Simulasikan keputusan besar sebelum benar-benar dijalankan',
];

/**
 * Value proposition section: makes the "reverse calculator" promise from the
 * hero concrete by contrasting the old way of guessing with the Yastar way
 * of planning backwards from a profit target.
 */
export function ValueProposition() {
  return (
    <section className="py-16 md:py-20" data-testid="section-value-proposition">
      <div className="text-center max-w-2xl mx-auto mb-10 flex flex-col gap-3">
        <span className="text-sm font-semibold text-primary tracking-wide uppercase">
          Kenapa Yastar berbeda
        </span>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          Berhenti menebak, mulai merencanakan
        </h2>
        <p className="text-muted-foreground text-lg">
          Kalkulator bisnis biasa memberitahumu laba setelah semuanya terjadi. Yastar membalik
          urutannya, jadi kamu tahu langkahnya sebelum mengambil keputusan.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        <Card className="border-border bg-muted/40" data-testid="card-old-way">
          <CardContent className="pt-6 flex flex-col gap-4">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              Cara lama
            </span>
            <ul className="flex flex-col gap-3">
              {OLD_WAY.map((text) => (
                <li key={text} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted-foreground/10">
                    <X className="h-3 w-3" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card
          className="border-primary/30 bg-primary/5 shadow-md relative overflow-hidden"
          data-testid="card-yastar-way"
        >
          <CardContent className="pt-6 flex flex-col gap-4">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
              Cara Yastar
            </span>
            <ul className="flex flex-col gap-3">
              {YASTAR_WAY.map((text) => (
                <li key={text} className="flex items-start gap-3 text-sm font-medium">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3 w-3" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
