import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomBytes } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbFile = path.join(__dirname, '../.db/database.json');

export function generateId(): string {
  return randomBytes(16).toString('hex');
}

export interface Customer {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  phone: string;
  address: string;
  created_at: string;
}

export interface Technician {
  id: string;
  tech_id: string;
  password_hash: string;
  name: string;
  phone: string;
  specialization: string;
  created_at: string;
}

export interface ServiceRequest {
  id: string;
  customer_id: string;
  problem_description: string;
  preferred_date: string;
  preferred_time: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  assigned_tech_id?: string;
  rejection_reason?: string;
  created_at: string;
}

export interface FileUpload {
  id: string;
  request_id: string;
  filename: string;
  file_path: string;
  file_type: string;
  uploaded_at: string;
}

export interface ChatMessage {
  id: string;
  request_id: string;
  sender_id: string;
  sender_type: 'customer' | 'technician';
  encrypted_message: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  user_type: 'customer' | 'technician';
  title: string;
  message: string;
  request_id?: string;
  read: boolean;
  created_at: string;
}

export interface Database {
  customers: Customer[];
  technicians: Technician[];
  service_requests: ServiceRequest[];
  file_uploads: FileUpload[];
  chat_messages: ChatMessage[];
  notifications: Notification[];
}

function ensureDbDir() {
  const dir = path.join(__dirname, '../.db');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function loadDatabase(): Database {
  ensureDbDir();
  try {
    if (fs.existsSync(dbFile)) {
      const data = fs.readFileSync(dbFile, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading database:', error);
  }

  return {
    customers: [],
    technicians: [],
    service_requests: [],
    file_uploads: [],
    chat_messages: [],
    notifications: [],
  };
}

export function saveDatabase(db: Database) {
  ensureDbDir();
  fs.writeFileSync(dbFile, JSON.stringify(db, null, 2), 'utf-8');
}
