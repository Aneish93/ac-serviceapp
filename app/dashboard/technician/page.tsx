'use client';

import { useAuth } from '@/app/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LogOut, CheckCircle, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';

interface ServiceRequest {
  id: string;
  customer_id: string;
  problem_description: string;
  preferred_date: string;
  preferred_time: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  created_at: string;
}

interface CustomerDetails {
  id: string;
  name: string;
  phone: string;
  address: string;
  email: string;
}

export default function TechnicianDashboard() {
  const { technician, logout, userType } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [customerMap, setCustomerMap] = useState<{ [key: string]: CustomerDetails }>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userType !== 'technician' || !technician) {
      router.push('/auth/tech-login');
      return;
    }
    fetchRequests();
  }, [technician, userType, router]);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/service-requests');
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests);
        
        // Fetch customer details for all requests
        const customerDetails: { [key: string]: CustomerDetails } = {};
        for (const request of data.requests) {
          try {
            const custResponse = await fetch(`/api/customers/${request.customer_id}`);
            if (custResponse.ok) {
              const custData = await custResponse.json();
              customerDetails[request.customer_id] = custData.customer;
            }
          } catch (err) {
            console.error('[v0] Error fetching customer:', err);
          }
        }
        setCustomerMap(customerDetails);
      }
    } catch (error) {
      console.error('[v0] Error fetching requests:', error);
    }
  };

  const handleAccept = async (requestId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/service-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'accepted',
          tech_id: technician?.id,
        }),
      });

      if (response.ok) {
        await fetchRequests();
        setExpandedId(null);
      }
    } catch (error) {
      console.error('[v0] Error accepting request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (requestId: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/service-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'rejected',
          rejection_reason: rejectionReason,
        }),
      });

      if (response.ok) {
        await fetchRequests();
        setExpandedId(null);
        setRejectionReason('');
      }
    } catch (error) {
      console.error('[v0] Error rejecting request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async (requestId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/service-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'completed',
        }),
      });

      if (response.ok) {
        await fetchRequests();
      }
    } catch (error) {
      console.error('[v0] Error completing request:', error);
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

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const acceptedRequests = requests.filter(r => r.status === 'accepted');
  const completedRequests = requests.filter(r => r.status === 'completed' || r.status === 'rejected');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">Service Management</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{technician?.name} (Tech ID: {technician?.tech_id})</span>
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
        {/* Pending Requests */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Pending Requests ({pendingRequests.length})</h2>
          {pendingRequests.length === 0 ? (
            <Card className="p-4 text-center">
              <p className="text-muted-foreground">No pending requests</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingRequests.map((request) => (
                <Card key={request.id} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">New Service Request</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Clock className="w-4 h-4 text-yellow-500" />
                  </div>

                  {/* Customer Details Section */}
                  {customerMap[request.customer_id] && (
                    <div className="bg-muted/50 border border-border rounded p-3 mb-3">
                      <h4 className="font-semibold text-foreground mb-2">Customer Information</h4>
                      <div className="space-y-1 text-sm">
                        <p><strong>Name:</strong> {customerMap[request.customer_id].name}</p>
                        <p><strong>Phone:</strong> {customerMap[request.customer_id].phone}</p>
                        <p><strong>Address:</strong> {customerMap[request.customer_id].address || 'Not provided'}</p>
                        <p><strong>Email:</strong> {customerMap[request.customer_id].email}</p>
                      </div>
                    </div>
                  )}

                  <p className="text-foreground mb-3">{request.problem_description}</p>
                  {request.preferred_date && (
                    <p className="text-sm text-muted-foreground mb-3">
                      Preferred: {request.preferred_date} at {request.preferred_time}
                    </p>
                  )}

                  {expandedId !== request.id ? (
                    <Button
                      variant="outline"
                      onClick={() => setExpandedId(request.id)}
                    >
                      Review Request
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Rejection Reason (if applicable)
                        </label>
                        <textarea
                          placeholder="Provide reason if you want to reject this request..."
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          disabled={isLoading}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                          rows={2}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleAccept(request.id)}
                          disabled={isLoading}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Accept
                        </Button>
                        <Button
                          onClick={() => handleReject(request.id)}
                          disabled={isLoading}
                          variant="destructive"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setExpandedId(null);
                            setRejectionReason('');
                          }}
                          disabled={isLoading}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Accepted Requests */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Active Requests ({acceptedRequests.length})</h2>
          {acceptedRequests.length === 0 ? (
            <Card className="p-4 text-center">
              <p className="text-muted-foreground">No active requests</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {acceptedRequests.map((request) => (
                <Card key={request.id} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">Active Service</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>

                  {/* Customer Details Section */}
                  {customerMap[request.customer_id] && (
                    <div className="bg-muted/50 border border-border rounded p-3 mb-3">
                      <h4 className="font-semibold text-foreground mb-2">Customer Information</h4>
                      <div className="space-y-1 text-sm">
                        <p><strong>Name:</strong> {customerMap[request.customer_id].name}</p>
                        <p><strong>Phone:</strong> {customerMap[request.customer_id].phone}</p>
                        <p><strong>Address:</strong> {customerMap[request.customer_id].address || 'Not provided'}</p>
                      </div>
                    </div>
                  )}

                  <p className="text-foreground mb-3">{request.problem_description}</p>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/technician/chat/${request.id}`}>
                      <Button variant="outline" size="sm">
                        Open Chat
                      </Button>
                    </Link>
                    <Button
                      onClick={() => handleComplete(request.id)}
                      disabled={isLoading}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      size="sm"
                    >
                      Mark Complete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Completed Requests */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">Completed/Rejected ({completedRequests.length})</h2>
          {completedRequests.length === 0 ? (
            <Card className="p-4 text-center">
              <p className="text-muted-foreground">No completed or rejected requests</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {completedRequests.map((request) => (
                <Card key={request.id} className="p-4 opacity-75">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground capitalize">{request.status}</h3>
                      <p className="text-foreground">{request.problem_description}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {getStatusIcon(request.status)}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
