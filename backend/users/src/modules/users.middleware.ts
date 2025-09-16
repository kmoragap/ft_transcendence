import { FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../utils/prisma';


export async function authenticateToken(request: FastifyRequest, reply: FastifyReply) {
  try {
    const token = request.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return reply.code(401).send({ error: 'No token provided' });
    }
    
    // step 1:check token with the auth service
    const response = await fetch('http://auth:3000/api/auth/verify', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return reply.code(401).send({ error: 'Invalid token' });
    }

    const authData = await response.json();
    // step 2: use the ID to fetch the full user from this services db
    const user = await prisma.user.findUnique({
      where: {
        id: authData.userId,
      },
    });

    if (!user) {
      // This case is important: the user exists in auth but not here.
      return reply.code(404).send({ error: 'User not found' });
    }
    request.user = user;

  } catch (error) {
    console.error('Token verification failed:', error);
    return reply.code(401).send({ error: 'Token verification failed' });
  }
}