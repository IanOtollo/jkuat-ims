'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signIn(email, password);
    
    if (error) {
      toast('error', error.message || 'Invalid credentials');
    } else {
      toast('success', 'Logged in successfully');
      router.push('/dashboard');
    }
    
    setLoading(false);
  };

  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden">
      {/* Left Side: Branding */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center p-20 border-r border-border bg-surface">
        <div className="mb-10">
          <img src="/logo.jpeg" alt="JKUAT Logo" className="w-24 h-24 object-contain" />
        </div>
        <h1 className="text-6xl font-display font-bold leading-tight mb-4">
          Emergency <br />
          <span className="text-accent">Incident</span> <br />
          Management
        </h1>
        <div className="h-px w-24 bg-accent mb-8" />
        <p className="text-xl font-display text-primary mb-2">Jomo Kenyatta University</p>
        <p className="text-sm uppercase tracking-[0.3em] text-muted font-medium">Security Operations Center</p>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-12">
            <h2 className="text-3xl font-display font-medium text-primary mb-2">Secure Login</h2>
            <p className="text-sm text-muted">Enter your credentials to access the SOC terminal.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@jkuat.ac.ke"
              required
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            />
            
            <Button type="submit" className="w-full" isLoading={loading}>
              Sign In to Dashboard
            </Button>
          </form>

          <div className="mt-12 pt-8 border-t border-border flex flex-col items-center">
            <p className="text-xs text-muted mb-4 uppercase tracking-widest font-medium">External Access</p>
            <Link 
              href="/portal" 
              className="text-sm text-accent hover:text-white transition-colors underline underline-offset-4"
            >
              Submit a Public Incident Report
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
