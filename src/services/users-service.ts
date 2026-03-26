import { db } from '../db';
import { users, sessions } from '../db/schema';
import { eq } from 'drizzle-orm';

export const usersService = {
  async register(payload: any) {
    const { name, email, password, phone } = payload;

    // Check if email already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      throw new Error('Email sudah terdaftar');
    }

    // Hash password using Bun's built-in hashing
    const hashedPassword = await Bun.password.hash(password, {
      algorithm: 'bcrypt',
      cost: 10,
    });

    // Save user to database
    await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      phone,
    });

    return { data: 'Registrasi Berhasil' };
  },

  async login(payload: any) {
    const { email, password } = payload;

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      throw new Error('Email atau password salah');
    }

    const isPasswordValid = await Bun.password.verify(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Email atau password salah');
    }

    const token = crypto.randomUUID();

    await db.insert(sessions).values({
      token,
      userId: user.id
    });

    return { data: token };
  },

  async getCurrentUser(token: string) {
    if (!token) {
      throw new Error('Unauthorized');
    }

    const result = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(eq(sessions.token, token))
      .limit(1);

    const user = result[0];

    if (!user) {
      throw new Error('Unauthorized');
    }

    return { data: user };
  },

  async logoutUser(token: string) {
    if (!token) {
      throw new Error('Unauthorized');
    }

    const [result]: any = await db.delete(sessions).where(eq(sessions.token, token));

    if (result.affectedRows === 0) {
      throw new Error('Unauthorized');
    }

    return { data: 'OK' };
  }
};
