import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, getCustomerByEmail, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const customer = getCustomerByEmail(email);
    if (!customer) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isPasswordValid = await verifyPassword(password, customer.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = generateToken();

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
      },
      token,
    });
  } catch (error) {
    console.error('[v0] Customer login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
