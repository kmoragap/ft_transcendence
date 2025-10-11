import 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
  	sayBlah(): string;
  }

  interface FastifyRequest {
	user?: {
		id: string;
		email: string;
		username: string;
	};
  }
}

