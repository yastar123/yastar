import { useLocation } from 'wouter';
import { ArrowRight, Check, Compass, MessageCircle, Scissors, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ValueProposition } from '@/components/value-proposition';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
const WA_NUMBER = '6285366195381';

function waLink(msg?: string) {
  const base = `https://wa.me/${WA_NUMBER}`;
  return msg ? `${base}?text=${encodeURIComponent(msg)}` : base;
}

export default function HomePage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-[100dvh] bg-background" data-testid="page-home">
      <header className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={`${basePath}/logo.svg`} alt="Yastar" className="h-9 w-9 rounded-xl" />
          <span className="text-lg font-bold tracking-tight">Yastar</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => setLocation('/sign-in')} data-testid="link-sign-in">
            Masuk
          </Button>
          <Button
            asChild
            data-testid="link-wa-header"
          >
            <a href={waLink('Halo, saya ingin tanya tentang Yastar')} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4 mr-2" /> Hubungi Kami
            </a>
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6">
        {/* Hero */}
        <section className="py-16 md:py-24 text-center flex flex-col items-center gap-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary font-medium">
            <Compass className="h-4 w-4" /> Kalkulator Bisnis Terbalik
          </span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl leading-[1.1]">
            Mulai dari <span className="text-primary">laba yang kamu mau</span>,
            temukan jalannya.
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            Yastar membalik arah kalkulator bisnis: tentukan target laba salon, barbershop,
            nail studio, atau spa-mu — kami hitung berapa klien yang harus kamu layani untuk
            mencapainya.
          </p>
          <div className="flex items-center gap-3 pt-2 flex-wrap justify-center">
            <Button size="lg" onClick={() => setLocation('/sign-in')} data-testid="button-hero-cta">
              Masuk & Hitung Sekarang <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href={waLink('Halo, saya ingin tanya tentang Yastar')} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4 mr-2" /> Tanya via WhatsApp
              </a>
            </Button>
          </div>
        </section>

        <ValueProposition />

        {/* Feature cards */}
        <section className="grid md:grid-cols-3 gap-4 pb-24">
          <FeatureCard
            icon={Compass}
            title="Target Terbalik"
            description="Masukkan target laba bulanan, dapatkan jumlah klien dan tingkat utilisasi yang dibutuhkan — lengkap dengan analisa apakah itu realistis."
          />
          <FeatureCard
            icon={Sparkles}
            title="Insight Otomatis"
            description="Sistem insight kami menandai risiko seperti target yang terlalu agresif, margin tipis, atau komisi karyawan yang tidak sehat."
          />
          <FeatureCard
            icon={TrendingUp}
            title="Simpan & Bandingkan Skenario"
            description="Simpan beberapa skenario keputusan bisnis — misalnya sebelum menambah karyawan baru — dan bandingkan hasilnya kapan saja."
          />
        </section>

        {/* Pricing */}
        <section className="pb-24" id="harga">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Harga yang Sepadan dengan Keputusannya</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Bayar sekali untuk akses penuh, tanpa berlangganan bulanan yang tidak natural untuk alat keputusan bisnis.
              Akun dibuat oleh admin — hubungi kami untuk mulai.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <PricingCard
              name="Gratis"
              price="Rp 0"
              period=""
              description="Coba sebelum memutuskan. Cocok untuk eksplorasi awal."
              features={[
                '2 skenario tersimpan',
                'Kalkulator target terbalik',
                'Insight otomatis',
              ]}
              cta="Hubungi Admin"
              ctaHref={waLink('Halo, saya ingin akses Yastar paket Gratis')}
            />
            <PricingCard
              name="Starter"
              price="Rp 99.000"
              period="/bulan"
              description="Untuk owner yang aktif mengevaluasi strategi bisnis."
              badge="Populer"
              features={[
                '15 skenario tersimpan',
                'Kalkulator target terbalik',
                'Insight otomatis',
                'Export skenario (PDF)',
              ]}
              cta="Pesan via WhatsApp"
              ctaHref={waLink('Halo, saya ingin berlangganan Yastar paket Starter')}
              highlighted
            />
            <PricingCard
              name="Professional"
              price="Rp 199.000"
              period="/bulan"
              description="Untuk owner dengan banyak skenario dan kebutuhan analisis mendalam."
              features={[
                'Skenario tanpa batas',
                'Kalkulator target terbalik',
                'Insight otomatis',
                'Export skenario (PDF)',
                'Akses benchmark industri',
              ]}
              cta="Pesan via WhatsApp"
              ctaHref={waLink('Halo, saya ingin berlangganan Yastar paket Professional')}
            />
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="pb-24">
          <Card className="bg-primary text-primary-foreground overflow-hidden">
            <CardContent className="py-10 px-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <Scissors className="h-10 w-10 opacity-80 shrink-0" />
                <div>
                  <h2 className="text-xl font-semibold">Dibuat khusus untuk pemilik usaha jasa kecantikan</h2>
                  <p className="text-primary-foreground/80 mt-1">
                    Salon, barbershop, nail studio, dan spa — bukan alat POS harian, tapi teman
                    berpikir saat mengambil keputusan bisnis besar.
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="lg"
                asChild
                data-testid="button-bottom-cta"
              >
                <a href={waLink('Halo, saya ingin tanya tentang Yastar')} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4 mr-2" /> Hubungi via WhatsApp
                </a>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="max-w-5xl mx-auto px-6 py-8 text-sm text-muted-foreground border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>© {new Date().getFullYear()} Yastar. Semua hak dilindungi.</span>
        <a
          href={waLink('Halo, saya ingin tanya tentang Yastar')}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 hover:text-foreground transition-colors"
        >
          <MessageCircle className="h-4 w-4" /> Hubungi: 0853-6619-5381
        </a>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Compass;
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6 flex flex-col gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}

function PricingCard({
  name,
  price,
  period,
  description,
  features,
  cta,
  ctaHref,
  badge,
  highlighted = false,
}: {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  ctaHref: string;
  badge?: string;
  highlighted?: boolean;
}) {
  return (
    <Card className={highlighted ? 'border-primary shadow-lg ring-1 ring-primary/20' : ''}>
      <CardContent className="pt-6 flex flex-col gap-4 h-full">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-base">{name}</h3>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold">{price}</span>
              {period && <span className="text-sm text-muted-foreground">{period}</span>}
            </div>
          </div>
          {badge && <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-0">{badge}</Badge>}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        <ul className="flex flex-col gap-2 flex-1">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm">
              <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              {f}
            </li>
          ))}
        </ul>
        <Button
          className="w-full mt-2"
          variant={highlighted ? 'default' : 'outline'}
          asChild
        >
          <a href={ctaHref} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4 mr-2" />
            {cta}
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
