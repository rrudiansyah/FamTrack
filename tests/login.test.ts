import { describe, it, expect, beforeEach } from 'bun:test';
import { app } from '../src/index';
import { clearDatabase } from './setup';

describe('User Login (POST /api/users/login)', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  const testUser = {
    name: 'Login User',
    email: 'login@example.com',
    password: 'password123',
    phone: '0812345678',
  };

  it('should login successfully with correct credentials', async () => {
    // Register user first
    await app.handle(
      new Request('http://localhost/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser),
      })
    );

    // Login
    const response = await app.handle(
      new Request('http://localhost/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password,
        }),
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data).toBeTypeOf('string'); // The token
  });

  it('should fail with incorrect password', async () => {
    // Register user first
    await app.handle(
      new Request('http://localhost/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser),
      })
    );

    // Login with wrong password
    const response = await app.handle(
      new Request('http://localhost/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email,
          password: 'wrong-password',
        }),
      })
    );

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Email atau password salah');
  });

  it('should fail if email is not found', async () => {
    const response = await app.handle(
      new Request('http://localhost/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'notfound@example.com',
          password: 'password123',
        }),
      })
    );

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Email atau password salah');
  });

  it('should fail with invalid email format', async () => {
    const response = await app.handle(
      new Request('http://localhost/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'not-an-email',
          password: 'password123',
        }),
      })
    );

    expect(response.status).toBe(422);
  });
});
