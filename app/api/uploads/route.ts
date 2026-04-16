import { NextRequest, NextResponse } from 'next/server';
import { generateId } from '@/lib/auth';
import { loadDatabase, saveDatabase } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const request_id = formData.get('request_id') as string;
    const customer_id = formData.get('customer_id') as string;

    if (!file || !request_id || !customer_id) {
      return NextResponse.json({ error: 'File, request_id, and customer_id are required' }, { status: 400 });
    }

    const db = loadDatabase();
    const serviceRequest = db.service_requests.find(r => r.id === request_id);
    if (!serviceRequest) {
      return NextResponse.json({ error: 'Service request not found' }, { status: 404 });
    }

    if (serviceRequest.customer_id !== customer_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Create uploads directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    // Save file
    const fileName = `${generateId()}-${file.name}`;
    const filePath = path.join(uploadDir, fileName);
    const fileBuffer = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(fileBuffer));

    // Save file record to database
    const fileId = generateId();
    const fileRecord = {
      id: fileId,
      request_id,
      filename: file.name,
      file_path: `/uploads/${fileName}`,
      file_type: file.type,
      uploaded_at: new Date().toISOString(),
    };

    db.file_uploads.push(fileRecord);
    saveDatabase(db);

    return NextResponse.json({ success: true, file: fileRecord });
  } catch (error) {
    console.error('[v0] File upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
