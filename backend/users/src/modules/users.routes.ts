import { FastifyInstance } from 'fastify';
import { 
  createUserHandler, 
  deleteUserHandler, 
  getUsersHandler, 
  getUserByEmailHandler 
} from '../modules/users.controller';
import { authenticateToken } from '../modules/users.middleware';

export default async function userRoutes(fastify: FastifyInstance) {
  // public routes
  fastify.post('/', createUserHandler);  // user registartion
  fastify.get('/by-email/:email', getUserByEmailHandler); // for the auth service
  
  // protected routes
  fastify.get('/', { preHandler: [authenticateToken] }, getUsersHandler);
  fastify.delete('/', { preHandler: [authenticateToken] }, deleteUserHandler);
}