import { FastifyPluginAsync } from 'fastify';

const securityPlugin: FastifyPluginAsync = async (fastify, opts) => {
  console.log('[SECURITY PLUGIN] Registered');

  fastify.get('/security', async (request, reply) => {
    console.log('[SECURITY PLUGIN] Incoming request:', request.url);
    return { message: 'Blah from plugin!' };
  });

  if (!fastify.hasDecorator('sayBlah')) {
    fastify.decorate('sayBlah', () => 'Blah from decorated function!');
  }
};

export default securityPlugin;
