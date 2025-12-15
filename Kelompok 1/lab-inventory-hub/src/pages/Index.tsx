import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { isAuthenticated } from '@/lib/api';
import { 
  FlaskConical, 
  Database, 
  Shield, 
  Zap, 
  ArrowRight,
  Package,
  Users,
  BarChart3
} from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const features = [
    {
      icon: Package,
      title: 'Manajemen Inventaris',
      description: 'CRUD lengkap untuk semua item laboratorium dengan kategorisasi',
    },
    {
      icon: Shield,
      title: 'Autentikasi JWT',
      description: 'Sistem login aman dengan token-based authentication',
    },
    {
      icon: Users,
      title: 'Multi-User',
      description: 'Setiap user hanya bisa mengakses inventarisnya sendiri',
    },
    {
      icon: BarChart3,
      title: 'Dashboard Analytics',
      description: 'Statistik real-time dan monitoring stok rendah',
    },
  ];

  return (
    <div className="min-h-screen gradient-hero">
      {/* Hero Section */}
      <div className="container">
        <nav className="flex items-center justify-between py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary shadow-glow">
              <FlaskConical className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">LabInventory</span>
          </div>
          <Link to="/auth">
            <Button variant="outline">Masuk</Button>
          </Link>
        </nav>

        <div className="mx-auto max-w-4xl py-20 text-center">
          <div className="animate-slide-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground">
              <Database className="h-4 w-4" />
              RESTful API Backend Ready
            </div>
            
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Sistem Manajemen{' '}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Inventaris Laboratorium
              </span>
            </h1>
            
            <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground">
              Frontend modern untuk sistem inventaris lab. Siap dikoneksikan ke backend Express.js + Prisma + JWT Anda.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/auth">
                <Button size="lg" className="group">
                  Mulai Sekarang
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button size="lg" variant="outline">
                  <Zap className="mr-2 h-4 w-4" />
                  Lihat API Docs
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container pb-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card 
              key={feature.title} 
              className="group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-slide-up"
              style={{ animationDelay: `${(index + 1) * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* API Info Section */}
      <div className="border-t bg-card/50">
        <div className="container py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-2xl font-bold text-foreground">Koneksi ke Backend</h2>
            <p className="mb-6 text-muted-foreground">
              Atur environment variable untuk menghubungkan frontend ini ke backend Express.js Anda
            </p>
            <Card className="text-left">
              <CardContent className="p-6">
                <code className="block rounded-lg bg-muted p-4 font-mono text-sm">
                  <span className="text-muted-foreground"># .env</span><br />
                  <span className="text-primary">VITE_API_URL</span>=http://localhost:3000/api
                </code>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>Frontend untuk UAS Backend Development • Express.js + Prisma + JWT</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
