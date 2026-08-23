"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Scale, Building, UserCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ROLES = [
  { id: 'lawyer', name: 'Lawyer', icon: <UserCircle className="w-6 h-6 mb-2" />, desc: 'Full access to case files and unredacted documents.' },
  { id: 'judge', name: 'Judge', icon: <Scale className="w-6 h-6 mb-2" />, desc: 'Maximum clearance. Full audit logs and unredacted vaults.' },
  { id: 'legal_receiver', name: 'Legal Receiver', icon: <FileSearch className="w-6 h-6 mb-2" />, desc: 'Standard access. PII and sensitive amounts are REDACTED.' },
  { id: 'org_admin', name: 'Organization Admin', icon: <Building className="w-6 h-6 mb-2" />, desc: 'System management and unredacted overview.' },
];

// Re-importing FileSearch here since lucide-react above missed it
import { FileSearch } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleLogin = () => {
    if (selectedRole) {
      localStorage.setItem('jurissync_role', selectedRole);
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="max-w-3xl w-full space-y-8">
        <div className="text-center">
          <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold tracking-tight">Secure Authorization Required</h1>
          <p className="text-muted-foreground mt-2">Select your clearance level to access the JurisSync Workbench.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ROLES.map(role => (
            <Card 
              key={role.id} 
              className={`cursor-pointer transition-all border-2 ${selectedRole === role.id ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'border-border hover:border-primary/50 bg-card/50'}`}
              onClick={() => setSelectedRole(role.id)}
            >
              <CardContent className="p-6 text-center flex flex-col items-center">
                <div className={`${selectedRole === role.id ? 'text-primary' : 'text-muted-foreground'}`}>
                  {role.icon}
                </div>
                <h3 className="font-semibold text-lg">{role.name}</h3>
                <p className="text-xs text-muted-foreground mt-2">{role.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center pt-6">
          <Button 
            size="lg" 
            className="w-full max-w-sm h-12 text-md glowing-btn bg-blue-600 hover:bg-blue-700 text-white border-0"
            disabled={!selectedRole}
            onClick={handleLogin}
          >
            Authenticate <Lock className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
