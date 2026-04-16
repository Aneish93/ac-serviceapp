import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import nacl from 'tweetnacl';
import { loadDatabase, saveDatabase, Customer, Technician, generateId } from './db';

export { generateId };

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(): string {
  return randomBytes(32).toString('hex');
}

// Encryption functions for E2E chat
export interface EncryptionResult {
  ciphertext: string;
  nonce: string;
}

export function encryptMessage(message: string, sharedKey: Uint8Array): EncryptionResult {
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  const messageUint8 = new TextEncoder().encode(message);
  const encrypted = nacl.secretbox(messageUint8, nonce, sharedKey);
  
  return {
    ciphertext: Buffer.from(encrypted).toString('base64'),
    nonce: Buffer.from(nonce).toString('base64'),
  };
}

export function decryptMessage(encrypted: EncryptionResult, sharedKey: Uint8Array): string {
  const ciphertext = Buffer.from(encrypted.ciphertext, 'base64');
  const nonce = Buffer.from(encrypted.nonce, 'base64');
  
  const decrypted = nacl.secretbox.open(ciphertext, nonce, sharedKey);
  if (!decrypted) {
    throw new Error('Decryption failed');
  }
  
  return new TextDecoder().decode(decrypted);
}

// Get customer by email
export function getCustomerByEmail(email: string): Customer | null {
  const db = loadDatabase();
  return db.customers.find(c => c.email === email) || null;
}

// Get technician by tech_id
export function getTechnicianByTechId(techId: string): Technician | null {
  const db = loadDatabase();
  return db.technicians.find(t => t.tech_id === techId) || null;
}

// Get user by ID
export function getUserById(userId: string, userType: 'customer' | 'technician'): Customer | Technician | null {
  const db = loadDatabase();
  if (userType === 'customer') {
    return db.customers.find(c => c.id === userId) || null;
  } else {
    return db.technicians.find(t => t.id === userId) || null;
  }
}

// Create new customer
export function createCustomer(email: string, password_hash: string, name: string, phone: string, address: string = ''): Customer {
  const db = loadDatabase();
  const id = generateId();
  const customer: Customer = {
    id,
    email,
    password_hash,
    name,
    phone,
    address,
    created_at: new Date().toISOString(),
  };
  db.customers.push(customer);
  saveDatabase(db);
  return customer;
}

// Create new technician
export function createTechnician(
  tech_id: string,
  password_hash: string,
  name: string,
  phone: string,
  specialization: string
): Technician {
  const db = loadDatabase();
  const id = generateId();
  const technician: Technician = {
    id,
    tech_id,
    password_hash,
    name,
    phone,
    specialization,
    created_at: new Date().toISOString(),
  };
  db.technicians.push(technician);
  saveDatabase(db);
  return technician;
}
