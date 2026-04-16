import { NextRequest, NextResponse } from 'next/server';
import { generateId } from '@/lib/auth';
import { loadDatabase, saveDatabase } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { tech_id, status, rejection_reason } = await request.json();
    const requestId = (await params).id;

    if (!status || !['accepted', 'rejected', 'completed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    if (status === 'rejected' && !rejection_reason) {
      return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 });
    }

    const db = loadDatabase();
    const serviceRequest = db.service_requests.find(r => r.id === requestId);

    if (!serviceRequest) {
      return NextResponse.json({ error: 'Service request not found' }, { status: 404 });
    }

    // Update service request
    serviceRequest.status = status as 'accepted' | 'rejected' | 'completed';
    if (status === 'accepted') {
      serviceRequest.assigned_tech_id = tech_id;
    }
    if (status === 'rejected') {
      serviceRequest.rejection_reason = rejection_reason;
    }

    // Create notification for customer
    let message = '';
    let title = '';

    if (status === 'accepted') {
      title = 'Request Accepted';
      message = 'Your AC service request has been accepted by the technician.';
    } else if (status === 'rejected') {
      title = 'Request Rejected';
      message = `Your request was rejected. Reason: ${rejection_reason}`;
    } else if (status === 'completed') {
      title = 'Service Completed';
      message = 'Your AC service has been completed.';
    }

    db.notifications.push({
      id: generateId(),
      user_id: serviceRequest.customer_id,
      user_type: 'customer',
      title,
      message,
      request_id: requestId,
      read: false,
      created_at: new Date().toISOString(),
    });

    saveDatabase(db);
    return NextResponse.json({ success: true, serviceRequest });
  } catch (error) {
    console.error('[v0] Update service request error:', error);
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const requestId = (await params).id;
    const db = loadDatabase();
    const serviceRequest = db.service_requests.find(r => r.id === requestId);

    if (!serviceRequest) {
      return NextResponse.json({ error: 'Service request not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, serviceRequest });
  } catch (error) {
    console.error('[v0] Get service request error:', error);
    return NextResponse.json({ error: 'Failed to fetch request' }, { status: 500 });
  }
}
