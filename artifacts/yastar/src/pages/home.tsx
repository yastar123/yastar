import { useLocation } from 'wouter';
import { ArrowRight, Compass, Scissors, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

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
          <Button onClick={() => setLocation('/sign-up')} data-testid="link-sign-up">
            Mulai Gratis
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6">
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
          <div className="flex items-center gap-3 pt-2">
            <Button size="lg" onClick={() => setLocation('/sign-up')} data-testid="button-hero-cta">
              Hitung Target Sekarang <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </section>

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

        <section className="pb-24">
          <Card className="bg-primary text-primary-foreground overflow-hidden">
            <CardContent className="py-10 px-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <Scissors className="h-10 w-10 opacity-80" />
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
                onClick={() => setLocation('/sign-up')}
                data-testid="button-bottom-cta"
              >
                Coba Gratis
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="max-w-5xl mx-auto px-6 py-8 text-sm text-muted-foreground border-t border-border">
        © {new Date().getFullYear()} Yastar. Semua hak dilindungi.
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
