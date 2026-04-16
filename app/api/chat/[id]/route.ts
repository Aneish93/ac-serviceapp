import { NextRequest, NextResponse } from 'next/server';
import { generateId } from '@/lib/auth';
import { loadDatabase, saveDatabase } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { sender_id, sender_type, encrypted_message } = await request.json();
    const requestId = (await params).id;

    if (!sender_id || !encrypted_message) {
      return NextResponse.json({ error: 'Sender ID and encrypted message are required' }, { status: 400 });
    }

    const db = loadDatabase();
    const messageId = generateId();
    const message = {
      id: messageId,
      request_id: requestId,
      sender_id,
      sender_type: sender_type as 'customer' | 'technician',
      encrypted_message,
      created_at: new Date().toISOString(),
    };

    db.chat_messages.push(message);
    saveDatabase(db);

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error('[v0] Send message error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const requestId = (await params).id;
    const db = loadDatabase();
    const messages = db.chat_messages.filter(m => m.request_id === requestId).sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    return NextResponse.json({ success: true, messages });
  } catch (error) {
    console.error('[v0] Get messages error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}
