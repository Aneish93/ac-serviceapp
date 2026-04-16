import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, getCustomerByEmail, createCustomer, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, phone, address } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Email, password, and name are required' }, { status: 400 });
    }

    // Check if customer already exists
    const existingCustomer = getCustomerByEmail(email);
    if (existingCustomer) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    // Hash password and create new customer
    const password_hash = await hashPassword(password);
    const customer = createCustomer(email, password_hash, name, phone || '', address || '');
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
    console.error('[v0] Customer signup error:', error);
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 });
  }
}
