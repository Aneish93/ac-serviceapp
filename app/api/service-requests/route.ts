import { NextRequest, NextResponse } from 'next/server';
import { generateId } from '@/lib/auth';
import { loadDatabase, saveDatabase } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { customer_id, problem_description, preferred_date, preferred_time } = await request.json();

    if (!customer_id || !problem_description) {
      return NextResponse.json({ error: 'Customer ID and problem description are required' }, { status: 400 });
    }

    const db = loadDatabase();
    const request_id = generateId();
    const serviceRequest = {
      id: request_id,
      customer_id,
      problem_description,
      preferred_date: preferred_date || '',
      preferred_time: preferred_time || '',
      status: 'pending' as const,
      created_at: new Date().toISOString(),
    };

    db.service_requests.push(serviceRequest);

    // Create notification for technicians
    db.notifications.push({
      id: generateId(),
      user_id: '', // Will be fetched by all technicians
      user_type: 'technician',
      title: 'New Service Request',
      message: `New AC service request from customer`,
      request_id: request_id,
      read: false,
      created_at: new Date().toISOString(),
    });

    saveDatabase(db);
    return NextResponse.json({ success: true, serviceRequest });
  } catch (error) {
    console.error('[v0] Create service request error:', error);
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const customer_id = searchParams.get('customer_id');
    const tech_id = searchParams.get('tech_id');

    const db = loadDatabase();

    let requests = db.service_requests;
    if (customer_id) {
      requests = requests.filter(r => r.customer_id === customer_id);
    }

    return NextResponse.json({ success: true, requests });
  } catch (error) {
    console.error('[v0] Get service requests error:', error);
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
  }
}
