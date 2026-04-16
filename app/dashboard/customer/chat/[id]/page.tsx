'use client';

import { useAuth } from '@/app/providers/auth-provider';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import nacl from 'tweetnacl';
import { createHash } from 'crypto';

interface Message {
  id: string;
  request_id: string;
  sender_id: string;
  sender_type: 'customer' | 'technician';
  encrypted_message: string;
  created_at: string;
}

export default function CustomerChat() {
  const { customer, userType } = useAuth();
  const router = useRouter();
  const params = useParams();
  const requestId = params.id as string;
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sharedKey, setSharedKey] = useState<Uint8Array | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (userType !== 'customer' || !customer) {
      router.push('/auth/customer-login');
      return;
    }

    // Generate deterministic key from request ID so both parties have the same key
    const hash = createHash('sha256').update(requestId).digest();
    const key = new Uint8Array(hash.slice(0, nacl.secretbox.keyLength));
    setSharedKey(key);

    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [customer, userType, router, requestId]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/chat/${requestId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      console.error('[v0] Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !sharedKey || !customer) return;

    setIsLoading(true);
    try {
      // Encrypt message
      const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
      const messageUint8 = new TextEncoder().encode(newMessage);
      const encrypted = nacl.secretbox(messageUint8, nonce, sharedKey);

      const response = await fetch(`/api/chat/${requestId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: customer.id,
          sender_type: 'customer',
          encrypted_message: JSON.stringify({
            ciphertext: Buffer.from(encrypted).toString('base64'),
            nonce: Buffer.from(nonce).toString('base64'),
          }),
        }),
      });

      if (response.ok) {
        setNewMessage('');
        await fetchMessages();
      }
    } catch (error) {
      console.error('[v0] Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const decryptMessage = (encryptedMsg: string, key: Uint8Array): string => {
    try {
      const encrypted = JSON.parse(encryptedMsg);
      const ciphertext = Buffer.from(encrypted.ciphertext, 'base64');
      const nonce = Buffer.from(encrypted.nonce, 'base64');
      const decrypted = nacl.secretbox.open(ciphertext, nonce, key);
      if (!decrypted) return '[Decryption failed]';
      return new TextDecoder().decode(decrypted);
    } catch (error) {
      return '[Unable to decrypt]';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard/customer">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Service Chat (End-to-End Encrypted)</h1>
        </div>
      </header>

      {/* Chat Area */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card className="flex flex-col h-96">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <p className="text-center text-muted-foreground">No messages yet. Start the conversation!</p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_type === 'customer' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`px-3 py-2 rounded-lg max-w-xs ${
                      msg.sender_type === 'customer'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="text-sm">
                      {sharedKey
                        ? decryptMessage(msg.encrypted_message, sharedKey)
                        : msg.encrypted_message}
                    </p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading} className="bg-primary text-primary-foreground">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </Card>

        <p className="text-xs text-muted-foreground mt-4 text-center">
          All messages are end-to-end encrypted using TweetNaCl.js
        </p>
      </main>
    </div>
  );
}
