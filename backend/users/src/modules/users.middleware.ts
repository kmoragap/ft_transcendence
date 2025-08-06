import { FastifyRequest, FastifyReply } from 'fastify';

export interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    userId: number;
    email: string;
    username: string;
  };
}

export async function authenticateToken(request: AuthenticatedRequest, reply: FastifyReply) {
  try {
    const token = request.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return reply.code(401).send({ error: 'No token provided' });
    }

    // check token with the auth service
    const response = await fetch('http://auth:3000/api/auth/verify', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return reply.code(401).send({ error: 'Invalid token' });
    }

    const data = await response.json();
    request.user = data.user;
  } catch (error) {
    return reply.code(401).send({ error: 'Token verification failed' });
  }
}