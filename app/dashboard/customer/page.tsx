'use client';

import { useAuth } from '@/app/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { LogOut, Plus, MessageSquare, Clock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

interface ServiceRequest {
  id: string;
  customer_id: string;
  problem_description: string;
  preferred_date: string;
  preferred_time: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  created_at: string;
  rejection_reason?: string;
}

export default function CustomerDashboard() {
  const { customer, logout, userType } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    problem_description: '',
    preferred_date: '',
    preferred_time: '',
  });
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    if (userType !== 'customer' || !customer) {
      router.push('/auth/customer-login');
      return;
    }
    fetchRequests();
  }, [customer, userType, router]);

  const fetchRequests = async () => {
    try {
      const response = await fetch(`/api/service-requests?customer_id=${customer?.id}`);
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests);
      }
    } catch (error) {
      console.error('[v0] Error fetching requests:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/service-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customer?.id,
          ...formData,
        }),
      });

      if (!response.ok) throw new Error('Failed to create request');
      const data = await response.json();
      const requestId = data.serviceRequest.id;

      // Upload files if any
      if (files.length > 0) {
        for (const file of files) {
          const uploadFormData = new FormData();
          uploadFormData.append('file', file);
          uploadFormData.append('request_id', requestId);
          uploadFormData.append('customer_id', customer?.id || '');

          await fetch('/api/uploads', {
            method: 'POST',
            body: uploadFormData,
          });
        }
      }

      setFormData({ problem_description: '', preferred_date: '', preferred_time: '' });
      setFiles([]);
      setShowBookingForm(false);
      await fetchRequests();
    } catch (error) {
      console.error('[v0] Error creating request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">My Service Requests</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{customer?.name}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                logout();
                router.push('/');
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* New Request Button */}
        <Button
          onClick={() => setShowBookingForm(!showBookingForm)}
          className="mb-6 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Book New Service
        </Button>

        {/* Booking Form */}
        {showBookingForm && (
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Book AC Service</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Problem Description
                </label>
                <textarea
                  placeholder="Describe the problem with your AC unit..."
                  value={formData.problem_description}
                  onChange={(e) => setFormData({ ...formData, problem_description: e.target.value })}
                  required
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Preferred Date
                  </label>
                  <Input
                    type="date"
                    value={formData.preferred_date}
                    onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Preferred Time
                  </label>
                  <Input
                    type="time"
                    value={formData.preferred_time}
                    onChange={(e) => setFormData({ ...formData, preferred_time: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Upload Images/Documents (Optional)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={(e) => setFiles(Array.from(e.target.files || []))}
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                />
                {files.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {files.length} file(s) selected
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading} className="bg-primary text-primary-foreground">
                  {isLoading ? 'Submitting...' : 'Submit Request'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowBookingForm(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Service Requests List */}
        <div className="grid gap-4">
          {requests.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No service requests yet. Book one to get started!</p>
            </Card>
          ) : (
            requests.map((request) => (
              <Card key={request.id} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(request.status)}
                    <div>
                      <h3 className="font-semibold text-foreground capitalize">{request.status}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {request.status === 'accepted' && (
                    <Link href={`/dashboard/customer/chat/${request.id}`}>
                      <Button size="sm" variant="outline" className="flex gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Chat
                      </Button>
                    </Link>
                  )}
                </div>
                <p className="text-foreground mb-3">{request.problem_description}</p>
                {request.preferred_date && (
                  <p className="text-sm text-muted-foreground mb-2">
                    Preferred: {request.preferred_date} at {request.preferred_time}
                  </p>
                )}
                {request.rejection_reason && (
                  <div className="bg-destructive/10 border border-destructive text-destructive text-sm p-2 rounded">
                    <strong>Rejection Reason:</strong> {request.rejection_reason}
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

