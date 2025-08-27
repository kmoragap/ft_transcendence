import { FastifyInstance } from 'fastify';
import { createGame, updateScore, finishGame, getGame } from './pong.controller';

export default async function pongRoutes(fastify: FastifyInstance) {
  // create a new game
  fastify.post('/games', createGame);
  
  // obtain game by id
  fastify.get('/games/:id', getGame);
  
  // update the score
  fastify.put('/games/:id/score', updateScore);
  
  // finish game
  fastify.put('/games/:id/finish', finishGame);
}