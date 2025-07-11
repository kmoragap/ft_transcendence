import fastify from 'fastify';

const server = fastify({ logger: true });

server.get('/', async (request, reply) => {
  return { message: 'Pong service is up!' } as const;
});

const start = async () => {
  try {
    await server.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Pong service running on port 3000');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
