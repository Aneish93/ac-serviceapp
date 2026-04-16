'use client';

import { useAuth } from '@/app/providers/auth-provider';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Wrench, Shield, MessageSquare, Clock, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { userType, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (token && userType === 'customer') {
      router.push('/dashboard/customer');
    } else if (token && userType === 'technician') {
      router.push('/dashboard/technician');
    }
  }, [token, userType, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Wrench className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">AC Tech Pro</h1>
          </div>
          <div className="flex gap-3">
            <Link href="/auth/customer-login">
              <Button variant="outline">Customer Login</Button>
            </Link>
            <Link href="/auth/tech-login">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Technician Login
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-bold text-foreground mb-6 text-balance">
            Professional AC Service at Your Doorstep
          </h2>
          <p className="text-xl text-muted-foreground mb-8 text-balance">
            Connect with certified AC technicians, book services instantly, and communicate securely with encrypted messaging
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/customer-signup">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Book Service Now
              </Button>
            </Link>
            <Link href="/auth/tech-signup">
              <Button size="lg" variant="outline">
                Join as Technician
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-20">
          {/* Feature 1 */}
          <div className="bg-card border border-border rounded-lg p-8 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <Clock className="w-8 h-8 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">Easy Booking</h3>
            </div>
            <p className="text-muted-foreground">
              Schedule your AC service in minutes with our simple and intuitive booking system
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-card border border-border rounded-lg p-8 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <Shield className="w-8 h-8 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">Secure Communication</h3>
            </div>
            <p className="text-muted-foreground">
              End-to-end encrypted chat ensures your conversations with technicians are completely private
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-card border border-border rounded-lg p-8 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <MessageSquare className="w-8 h-8 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">Real-time Support</h3>
            </div>
            <p className="text-muted-foreground">
              Send detailed problem reports with photos and documents for better service
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-card border border-border rounded-lg p-8 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <Zap className="w-8 h-8 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">Instant Notifications</h3>
            </div>
            <p className="text-muted-foreground">
              Get real-time notifications when technicians accept or respond to your requests
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-card border border-border rounded-lg p-8 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <Shield className="w-8 h-8 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">Certified Professionals</h3>
            </div>
            <p className="text-muted-foreground">
              All technicians on our platform are verified and highly trained AC specialists
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-card border border-border rounded-lg p-8 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <Clock className="w-8 h-8 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">Transparent Tracking</h3>
            </div>
            <p className="text-muted-foreground">
              Track your service request status in real-time from booking to completion
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get your AC fixed?</h2>
          <p className="text-lg mb-8 text-primary-foreground/90">
            Join thousands of satisfied customers who trust AC Tech Pro for their maintenance needs
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/customer-signup">
              <Button size="lg" variant="outline" className="border-2">
                Book Service
              </Button>
            </Link>
            <Link href="/auth/tech-signup">
              <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                Become a Partner
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <p>&copy; 2024 AC Tech Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
