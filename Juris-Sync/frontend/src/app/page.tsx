import Link from 'next/link';
import { Shield, FileSearch, ArrowRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="px-8 py-6 flex justify-between items-center border-b border-border/50">
        <div className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold tracking-tight">JurisSync</span>
        </div>
        <Link href="/login">
          <Button variant="outline" className="glowing-btn bg-background">
            Secure Login <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <div className="max-w-4xl space-y-8">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 text-sm px-4 py-1.5 mb-8">
            <Lock className="w-4 h-4 mr-2 inline" /> Enterprise Legal Tech Platform
          </Badge>
          <h1 className="text-6xl font-extrabold tracking-tight leading-tight">
            Secure Legal Auditing & <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Contradiction Detection</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload heterogeneous document bundles. Detect temporal, logical, and monetary contradictions instantly. Secure vault storage with strict RBAC redaction for complete confidentiality.
          </p>
          <div className="flex justify-center gap-4 pt-8">
            <Link href="/login">
              <Button size="lg" className="h-14 px-8 text-lg glowing-btn bg-blue-600 hover:bg-blue-700 text-white border-0">
                Enter Secure Workspace
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-border">
                Demo Dashboard (Dev)
              </Button>
            </Link>
          </div>
        </div>
      </main>
      
      <footer className="py-8 text-center text-sm text-muted-foreground border-t border-border/50">
        &copy; 2026 JurisSync Enterprise Solutions. All rights reserved.
      </footer>
    </div>
  );
}

// Temporary Badge definition to avoid extra imports if not needed, or we just import it
function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>{children}</span>;
}
