import { FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function AdminCmsPage() {
  return (
    <div className="p-6 flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold">CMS Landing Page</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Kelola konten yang tampil di halaman utama Yastar.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">Segera Hadir</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              Editor untuk judul, tagline, poin fitur, dan konten lainnya di halaman landing akan
              tersedia di sini.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
