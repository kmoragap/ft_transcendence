import { FastifyInstance } from 'fastify';
import { createUserHandler, getUsersHandler } from '../modules/users.controller';

export default async function userRoutes(fastify: FastifyInstance) {
  fastify.post('/', createUserHandler);
  fastify.get('/', getUsersHandler);
}
