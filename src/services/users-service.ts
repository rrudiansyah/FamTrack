import { db } from '../db';
import { users } from '../db/schema';
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
};
