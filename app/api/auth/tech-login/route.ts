import { NextRequest, NextResponse } from 'next/server';
import { getTechnicianByTechId, verifyPassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { tech_id, password } = await request.json();

    if (!tech_id || !password) {
      return NextResponse.json({ error: 'Tech ID and password are required' }, { status: 400 });
    }

    const technician = getTechnicianByTechId(tech_id);
    if (!technician) {
      return NextResponse.json({ error: 'Invalid tech ID or password' }, { status: 401 });
    }

    const isPasswordValid = await verifyPassword(password, technician.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid tech ID or password' }, { status: 401 });
    }

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
    console.error('[v0] Technician login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
