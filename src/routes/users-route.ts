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
      name: t.String(),
      email: t.String({ format: 'email' }),
      password: t.String(),
      phone: t.String(),
    })
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
    })
  })
  .derive(({ headers }) => {
    const authHeader = headers['authorization'];
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    return { token };
  })
  .get('/current', async ({ token, set }) => {
    try {
      if (!token) {
        set.status = 401;
        return { error: 'Unauthorized' };
      }

      const result = await usersService.getCurrentUser(token);
      return result;
    } catch (error: any) {
      if (error.message === 'Unauthorized') {
        set.status = 401;
        return { error: 'Unauthorized' };
      }
      set.status = 500;
      return { error: 'Internal Server Error' };
    }
  })
  .delete('/logout', async ({ token, set }) => {
    try {
      if (!token) {
        set.status = 401;
        return { error: 'Unauthorized' };
      }

      const result = await usersService.logoutUser(token);
      return result;
    } catch (error: any) {
      if (error.message === 'Unauthorized') {
        set.status = 401;
        return { error: 'Unauthorized' };
      }
      set.status = 500;
      return { error: 'Internal Server Error' };
    }
  });

