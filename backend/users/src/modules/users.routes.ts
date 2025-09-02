import { FastifyInstance } from 'fastify';
import { 
  createUserHandler, 
  deleteUserHandler, 
  getUsersHandler, 
  getUserByEmailHandler,
  getUserByUsernameHandler
} from '../modules/users.controller';
import { authenticateToken } from '../modules/users.middleware';
import { getUserStats, updateUserStats, getUsersByIds } from './users.controller';

export default async function userRoutes(fastify: FastifyInstance) {
  // public routes
  fastify.post('/', createUserHandler);  // user registartion
  fastify.get('/by-email/:email', getUserByEmailHandler); // for the auth service
  fastify.get('/by-username/:username', getUserByUsernameHandler); // for the auth service
  
  // protected routes
  fastify.get('/', { preHandler: [authenticateToken] }, getUsersHandler);
  fastify.delete('/', { preHandler: [authenticateToken] }, deleteUserHandler);

  // pong routes
  fastify.get('/users/:id/stats', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', pattern: '^c[a-z0-9]{24}$' }
        }
      }
    }
  }, getUserStats);
  
  fastify.put('/users/:id/stats', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', pattern: '^c[a-z0-9]{24}$' }
        }
      }
    }
  }, updateUserStats);
  
  fastify.post('/users/batch', getUsersByIds);
}