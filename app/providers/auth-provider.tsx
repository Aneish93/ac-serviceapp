'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { NotificationCenter } from './notification-center';

interface Customer {
  id: string;
  email: string;
  name: string;
}

interface Technician {
  id: string;
  tech_id: string;
  name: string;
}

interface AuthContextType {
  customer: Customer | null;
  technician: Technician | null;
  token: string | null;
  userType: 'customer' | 'technician' | null;
  loginAsCustomer: (email: string, password: string) => Promise<void>;
  loginAsTechnician: (tech_id: string, password: string) => Promise<void>;
  signupAsCustomer: (email: string, password: string, name: string, phone: string, address: string) => Promise<void>;
  signupAsTechnician: (tech_id: string, password: string, name: string, phone: string, specialization: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [userType, setUserType] = useState<'customer' | 'technician' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUserType = localStorage.getItem('userType') as 'customer' | 'technician' | null;
    const storedCustomer = localStorage.getItem('customer');
    const storedTechnician = localStorage.getItem('technician');

    if (storedToken && storedUserType) {
      setToken(storedToken);
      setUserType(storedUserType);
      if (storedUserType === 'customer' && storedCustomer) {
        setCustomer(JSON.parse(storedCustomer));
      } else if (storedUserType === 'technician' && storedTechnician) {
        setTechnician(JSON.parse(storedTechnician));
      }
    }
  }, []);

  const loginAsCustomer = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/customer-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Login failed');
      }

      const data = await response.json();
      setToken(data.token);
      setCustomer(data.customer);
      setUserType('customer');

      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userType', 'customer');
      localStorage.setItem('customer', JSON.stringify(data.customer));
    } catch (err) {
      const message = (err as Error).message;
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signupAsCustomer = async (email: string, password: string, name: string, phone: string, address: string = '') => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/customer-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, phone, address }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Signup failed');
      }

      const data = await response.json();
      setToken(data.token);
      setCustomer(data.customer);
      setUserType('customer');

      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userType', 'customer');
      localStorage.setItem('customer', JSON.stringify(data.customer));
    } catch (err) {
      const message = (err as Error).message;
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsTechnician = async (tech_id: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/tech-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tech_id, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Login failed');
      }

      const data = await response.json();
      setToken(data.token);
      setTechnician(data.technician);
      setUserType('technician');

      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userType', 'technician');
      localStorage.setItem('technician', JSON.stringify(data.technician));
    } catch (err) {
      const message = (err as Error).message;
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signupAsTechnician = async (
    tech_id: string,
    password: string,
    name: string,
    phone: string,
    specialization: string
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/tech-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tech_id, password, name, phone, specialization }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Signup failed');
      }

      const data = await response.json();
      setToken(data.token);
      setTechnician(data.technician);
      setUserType('technician');

      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userType', 'technician');
      localStorage.setItem('technician', JSON.stringify(data.technician));
    } catch (err) {
      const message = (err as Error).message;
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCustomer(null);
    setTechnician(null);
    setToken(null);
    setUserType(null);
    setError(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('customer');
    localStorage.removeItem('technician');
  };

  return (
    <AuthContext.Provider
      value={{
        customer,
        technician,
        token,
        userType,
        loginAsCustomer,
        loginAsTechnician,
        signupAsCustomer,
        signupAsTechnician,
        logout,
        isLoading,
        error,
      }}
    >
      {children}
      {(customer || technician) && <NotificationCenter />}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
