'use client';

import { useAuth } from '@/app/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Wrench } from 'lucide-react';

export default function TechSignup() {
  const { signupAsTechnician } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    tech_id: '',
    password: '',
    name: '',
    phone: '',
    specialization: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signupAsTechnician(
        formData.tech_id,
        formData.password,
        formData.name,
        formData.phone,
        formData.specialization
      );
      router.push('/dashboard/technician');
    } catch (err) {
      setError((err as Error).message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <Wrench className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">AC Tech Pro</h1>
          </Link>
          <h2 className="text-3xl font-bold text-foreground">Technician Sign Up</h2>
          <p className="text-muted-foreground mt-2">Join our network of professional AC technicians</p>
        </div>

        {/* Form */}
        <div className="bg-card border border-border rounded-lg p-8 shadow-lg max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 border border-destructive text-destructive p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Full Name
              </label>
              <Input
                type="text"
                name="name"
                placeholder="John Smith"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Technician ID
              </label>
              <Input
                type="text"
                name="tech_id"
                placeholder="TECH-12345"
                value={formData.tech_id}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <Input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Phone Number
              </label>
              <Input
                type="tel"
                name="phone"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Specialization (e.g., Residential, Commercial)
              </label>
              <Input
                type="text"
                name="specialization"
                placeholder="Residential AC Repair"
                value={formData.specialization}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          {/* Login link */}
          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              Already have an account?{' '}
              <Link href="/auth/tech-login" className="text-primary font-semibold hover:underline">
                Login here
              </Link>
            </p>
          </div>

          {/* Customer link */}
          <div className="mt-4 text-center text-sm">
            <p className="text-muted-foreground">
              Are you a customer?{' '}
              <Link href="/auth/customer-signup" className="text-primary font-semibold hover:underline">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
