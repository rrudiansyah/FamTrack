import { describe, it, expect, beforeEach } from 'bun:test';
import { app } from '../src/index';
import { clearDatabase } from './setup';
import { db } from '../src/db';
import { sessions } from '../src/db/schema';
import { eq } from 'drizzle-orm';

describe('User Logout (DELETE /api/users/logout)', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  const testUser = {
    name: 'Logout User',
    email: 'logout@example.com',
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

  it('should logout successfully and delete session from DB', async () => {
    const token = await getLoginToken();

    // Verify session exists in DB
    const sessionBefore = await db.query.sessions.findFirst({
      where: eq(sessions.token, token),
    });
    expect(sessionBefore).toBeDefined();

    // Logout
    const response = await app.handle(
      new Request('http://localhost/api/users/logout', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data).toBe('OK');

    // Verify session is deleted from DB
    const sessionAfter = await db.query.sessions.findFirst({
      where: eq(sessions.token, token),
    });
    expect(sessionAfter).toBeUndefined();
  });

  it('should fail with double logout (second attempt)', async () => {
    const token = await getLoginToken();

    // First logout
    await app.handle(
      new Request('http://localhost/api/users/logout', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
    );

    // Second logout
    const response = await app.handle(
      new Request('http://localhost/api/users/logout', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
    );

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('should fail with missing authorization header', async () => {
    const response = await app.handle(
      new Request('http://localhost/api/users/logout', {
        method: 'DELETE',
      })
    );

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('should fail with invalid token', async () => {
    const response = await app.handle(
      new Request('http://localhost/api/users/logout', {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer invalid-token',
        },
      })
    );

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Unauthorized');
  });
});
