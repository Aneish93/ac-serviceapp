import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, getTechnicianByTechId, createTechnician, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { tech_id, password, name, phone, specialization } = await request.json();

    if (!tech_id || !password || !name) {
      return NextResponse.json({ error: 'Tech ID, password, and name are required' }, { status: 400 });
    }

    // Check if technician already exists
    const existingTech = getTechnicianByTechId(tech_id);
    if (existingTech) {
      return NextResponse.json({ error: 'Technician already registered' }, { status: 400 });
    }

    const password_hash = await hashPassword(password);
    const technician = createTechnician(tech_id, password_hash, name, phone || '', specialization || '');
    const token = generateToken();

    return NextResponse.json({
      success: true,
      technician: {
        id: technician.id,
        tech_id: technician.tech_id,
        name: technician.name,
      },
      token,
    });
  } catch (error) {
    console.error('[v0] Technician signup error:', error);
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 });
  }
}
