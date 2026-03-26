import { describe, it, expect, beforeEach } from 'bun:test';
import { app } from '../src/index';
import { clearDatabase } from './setup';

describe('Get Current User (GET /api/users/current)', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  const testUser = {
    name: 'Profile User',
    email: 'profile@example.com',
    password: 'password123',
    phone: '0812345678',
  };

  async function getLoginToken() {
    // Register
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
    const body = await response.json() as { data: string };
    return body.data;
  }

  it('should get current user profile with valid token', async () => {
    const token = await getLoginToken();

    const response = await app.handle(
      new Request('http://localhost/api/users/current', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.email).toBe(testUser.email);
    expect(body.data.name).toBe(testUser.name);
  });

  it('should fail with missing authorization header', async () => {
    const response = await app.handle(
      new Request('http://localhost/api/users/current', {
        method: 'GET',
      })
    );

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('should fail with invalid token', async () => {
    const response = await app.handle(
      new Request('http://localhost/api/users/current', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer invalid-token',
        },
      })
    );

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('should fail with incorrect header format', async () => {
    const token = await getLoginToken();

    const response = await app.handle(
      new Request('http://localhost/api/users/current', {
        method: 'GET',
        headers: {
          'Authorization': token, // Missing Bearer prefix
        },
      })
    );

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Unauthorized');
  });
});
