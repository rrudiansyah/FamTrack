import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { usersRoute } from './routes/users-route';

export const app = new Elysia()
  .use(swagger({
    documentation: {
      info: {
        title: 'FamTrack API',
        version: '1.0.0',
        description: 'Mencatat aktivitas keluarga'
      }
    }
  }))
  .get('/', () => 'Hello dari Elysia')
  .use(usersRoute)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
