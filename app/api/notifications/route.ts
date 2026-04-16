import { NextRequest, NextResponse } from 'next/server';
import { loadDatabase, saveDatabase } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const user_id = searchParams.get('user_id');
    const user_type = searchParams.get('user_type') as 'customer' | 'technician' | null;

    if (!user_id || !user_type) {
      return NextResponse.json({ error: 'user_id and user_type are required' }, { status: 400 });
    }

    const db = loadDatabase();
    let notifications = db.notifications;

    if (user_type === 'customer') {
      notifications = notifications.filter(n => n.user_id === user_id && n.user_type === 'customer');
    } else if (user_type === 'technician') {
      notifications = notifications.filter(n => n.user_type === 'technician' && (n.user_id === user_id || n.user_id === ''));
    }

    notifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({ success: true, notifications });
  } catch (error) {
    console.error('[v0] Get notifications error:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { notification_ids } = await request.json();

    if (!notification_ids || !Array.isArray(notification_ids)) {
      return NextResponse.json({ error: 'notification_ids array is required' }, { status: 400 });
    }

    const db = loadDatabase();
    notification_ids.forEach((id: string) => {
      const notif = db.notifications.find(n => n.id === id);
      if (notif) {
        notif.read = true;
      }
    });

    saveDatabase(db);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[v0] Mark notifications as read error:', error);
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}
