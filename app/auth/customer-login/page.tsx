'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Wrench } from 'lucide-react';

export default function CustomerLogin() {
const router = useRouter();

const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState('');

const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();
setError('');
setIsLoading(true);

```
try {
  // Get stored customers
  let users = JSON.parse(localStorage.getItem("customers") || "[]");

  // Find matching user
  const user = users.find(
    (u: any) => u.email === email && u.password === password
  );

  if (!user) {
    throw new Error("Invalid Email or Password");
  }

  // Save logged-in customer
  localStorage.setItem("currentCustomer", JSON.stringify(user));

  // Redirect to dashboard
  router.push('/dashboard/customer');

} catch (err) {
  setError((err as Error).message || 'Login failed');
} finally {
  setIsLoading(false);
}
```

};

return ( <div className="min-h-screen bg-gradient-to-br from-background to-accent flex items-center justify-center p-4"> <div className="w-full max-w-md">

```
    {/* Header */}
    <div className="text-center mb-8">
      <Link href="/" className="flex items-center justify-center gap-2 mb-4">
        <Wrench className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">AC Tech Pro</h1>
      </Link>
      <h2 className="text-3xl font-bold text-foreground">Customer Login</h2>
      <p className="text-muted-foreground mt-2">
        Access your service requests and chat with technicians
      </p>
    </div>

    {/* Form */}
    <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-4">

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Email Address
          </label>
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>

      </form>

      {/* Sign up link */}
      <div className="mt-6 text-center text-sm">
        <p className="text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/auth/customer-signup" className="text-primary font-semibold hover:underline">
            Sign up here
          </Link>
        </p>
      </div>

      {/* Technician link */}
      <div className="mt-4 text-center text-sm">
        <p className="text-muted-foreground">
          Are you a technician?{' '}
          <Link href="/auth/tech-login" className="text-primary font-semibold hover:underline">
            Login here
          </Link>
        </p>
      </div>

    </div>
  </div>
</div>
```

);
}
