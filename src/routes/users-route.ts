import { Elysia, t } from 'elysia';
import { usersService } from '../services/users-service';

export const usersRoute = new Elysia({ prefix: '/api/users' })
  .post('/', async ({ body, set }) => {
    try {
      const result = await usersService.register(body);
      set.status = 201;
      return result;
    } catch (error: any) {
      if (error.message === 'Email sudah terdaftar') {
        set.status = 400;
        return { error: error.message };
      }
      set.status = 500;
      return { error: 'Terjadi kesalahan pada server' };
    }
  }, {
    body: t.Object({
      name: t.String({ maxLength: 255 }),
      email: t.String({ format: 'email' }),
      password: t.String(),
      phone: t.String(),
    }),
    response: {
      201: t.Object({
        data: t.String()
      }),
      400: t.Object({
        error: t.String()
      }),
      500: t.Object({
        error: t.String()
      })
    },
    detail: {
      tags: ['Users'],
      summary: 'Registrasi User Baru',
      description: 'Mendaftarkan pengguna baru ke sistem.'
    }
  })
  .post('/login', async ({ body, set }) => {
    try {
      const result = await usersService.login(body);
      set.status = 200;
      return result;
    } catch (error: any) {
      if (error.message === 'Email atau password salah') {
        set.status = 401;
        return { error: error.message };
      }
      set.status = 500;
      return { error: 'Terjadi kesalahan pada server' };
    }
  }, {
    body: t.Object({
      email: t.String({ format: 'email' }),
      password: t.String(),
    }),
    response: {
      200: t.Object({
        data: t.String()
      }),
      401: t.Object({
        error: t.String()
      }),
      500: t.Object({
        error: t.String()
      })
    },
    detail: {
      tags: ['Users'],
      summary: 'Login User',
      description: 'Masuk ke sistem dan mendapatkan token sesi.'
    }
  })
  .derive(({ headers }) => {
    const authHeader = headers['authorization'];
    return {
      token: authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null
    };
  })
  .get('/current', async ({ token, set }) => {
    try {
      const result = await usersService.getCurrentUser(token!);
      return result;
    } catch (error: any) {
      set.status = 401;
      return { error: 'Unauthorized' };
    }
  }, {
    response: {
      200: t.Object({
        data: t.Object({
          id: t.Number(),
          name: t.String(),
          email: t.String(),
          createdAt: t.Any(),
        })
      }),
      401: t.Object({
        error: t.String()
      })
    },
    detail: {
      tags: ['Users'],
      summary: 'Ambil Profil User Aktif',
      description: 'Mendapatkan data profil user berdasarkan token sesi.',
      security: [{ bearerAuth: [] }]
    }
  })
  .delete('/logout', async ({ token, set }) => {
    try {
      const result = await usersService.logoutUser(token!);
      return result;
    } catch (error: any) {
      set.status = 401;
      return { error: 'Unauthorized' };
    }
  }, {
    response: {
      200: t.Object({
        data: t.String()
      }),
      401: t.Object({
        error: t.String()
      })
    },
    detail: {
      tags: ['Users'],
      summary: 'Logout User',
      description: 'Mengakhiri sesi dan menghapus token dari database.',
      security: [{ bearerAuth: [] }]
    }
  });

