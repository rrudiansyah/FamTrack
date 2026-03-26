import { describe, it, expect, beforeEach } from 'bun:test';
import { app } from '../src/index';
import { clearDatabase } from './setup';

describe('User Registration (POST /api/users)', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  const validUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    phone: '0812345678',
  };

  it('should register a new user successfully', async () => {
    const response = await app.handle(
      new Request('http://localhost/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validUser),
      })
    );

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.data).toBe('Registrasi Berhasil');
  });

  it('should fail if email is already registered', async () => {
    // Register first user
    await app.handle(
      new Request('http://localhost/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validUser),
      })
    );

    // Try to register again with same email
    const response = await app.handle(
      new Request('http://localhost/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...validUser,
          name: 'Other Name',
        }),
      })
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe('Email sudah terdaftar');
  });

  it('should fail if name is longer than 255 characters', async () => {
    const response = await app.handle(
      new Request('http://localhost/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...validUser,
          name: 'a'.repeat(256),
        }),
      })
    );

    expect(response.status).toBe(422);
  });

  it('should fail if email format is invalid', async () => {
    const response = await app.handle(
      new Request('http://localhost/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...validUser,
          email: 'invalid-email',
        }),
      })
    );

    expect(response.status).toBe(422);
  });

  it('should fail if required fields are missing', async () => {
    const response = await app.handle(
      new Request('http://localhost/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Missing Fields',
        }),
      })
    );

    expect(response.status).toBe(422);
  });
});
