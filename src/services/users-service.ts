import { db } from '../db';
import { users, sessions } from '../db/schema';
import { eq } from 'drizzle-orm';

export const usersService = {
  /**
   * Mendaftarkan pengguna baru ke dalam sistem.
   * Melakukan pengecekan ketersediaan email, melakukan hashing pada password,
   * dan menyematkan data pengguna ke dalam tabel 'users'.
   * 
   * @param payload Objek yang berisi informasi name, email, password, dan phone.
   * @returns Pesan keberhasilan jika registrasi sukses.
   */
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

  /**
   * Mengautentikasi pengguna berdasarkan email dan password.
   * Memvalidasi keberadaan email, memverifikasi kesesuaian password (hash),
   * dan membuat token sesi (UUID) unik yang disimpan ke dalam tabel 'sessions'.
   * 
   * @param payload Objek yang berisi informasi email dan password.
   * @returns Token akses (Bearer) jika login berhasil.
   */
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

  /**
   * Mengambil data profil pengguna yang saat ini sedang login.
   * Mencocokkan token akses yang diberikan dengan token di tabel 'sessions',
   * kemudian mengambil relasi data profil pengguna dari tabel 'users'.
   * 
   * @param token Token UUID akses pengguna dari header Authorization.
   * @returns Data profil pengguna (id, name, email, createdAt).
   */
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

  /**
   * Mengakhiri sesi pengguna saat ini.
   * Mencari sesi aktif berdasarkan token yang diberikan dan
   * menghapusnya dari tabel 'sessions' sehingga token tidak berlaku lagi.
   * 
   * @param token Token UUID akses pengguna dari header Authorization.
   * @returns Pesan sukses ('OK') jika proses logout berhasil.
   */
  async logoutUser(token: string) {
    if (!token) {
      throw new Error('Unauthorized');
    }

    const session = await db.query.sessions.findFirst({
      where: eq(sessions.token, token),
    });

    if (!session) {
      throw new Error('Unauthorized');
    }

    await db.delete(sessions).where(eq(sessions.token, token));

    return { data: 'OK' };
  }
};
