'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './auth-provider';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Notification {
  id: string;
  user_id: string;
  user_type: 'customer' | 'technician';
  title: string;
  message: string;
  request_id?: string;
  read: boolean;
  created_at: string;
}

export function NotificationCenter() {
  const { customer, technician, userType } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    if (!customer && !technician) return;

    const userId = customer?.id || technician?.id;
    if (!userId) return;

    fetchNotifications(userId, userType || 'customer');
    const interval = setInterval(() => {
      fetchNotifications(userId, userType || 'customer');
    }, 5000);

    return () => clearInterval(interval);
  }, [customer, technician, userType]);

  const fetchNotifications = async (userId: string, userType: 'customer' | 'technician') => {
    try {
      const response = await fetch(`/api/notifications?user_id=${userId}&user_type=${userType}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('[v0] Error fetching notifications:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Notification Bell */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-shadow"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {showPanel && (
        <div className="absolute bottom-20 right-0 w-96 bg-card border border-border rounded-lg shadow-lg max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h3 className="font-semibold text-foreground">Notifications</h3>
            <button
              onClick={() => setShowPanel(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 p-4">
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No notifications</p>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3 rounded-lg border ${
                    notif.read
                      ? 'bg-background border-border'
                      : 'bg-primary/10 border-primary/20'
                  }`}
                >
                  <p className="font-semibold text-sm text-foreground">{notif.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(notif.created_at).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
