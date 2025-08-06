import { FastifyReply, FastifyRequest } from "fastify";
import * as bcrypt from 'bcrypt';
import prisma from '../utils/prisma'

//function to comunicate with the users services
async function getUserByEmail(email: string)
{
    try {
    const response = await fetch(`http://users:3000/api/users/by-email/${email}`);
    if(!response.ok) return null;
    return await response.json();
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
}
//create the user in services users
async function createUser(username: string, email: string, firstname: string, password: string) {
    try {
        const response = await fetch(`http://users:3000/api/users/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, firstname, password })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create user');
        }
        
        return await response.json();
    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    }
}

//register the user
export async function registerHandler(request: FastifyRequest, reply: FastifyReply) {
    const { username, email, firstname, password } = request.body as {
        username: string;
        email: string;
        firstname: string;
        password: string;
    };

    try {
        // 1.create the users in the usrs services
        const user = await createUser(username, email, firstname, password);

        // 2.generate the jwt
        const token = request.server.jwt.sign(
            {
                userId: user.id,
                email: email
            },
            { expiresIn: '24h' }
        );

        // 3.save the session
        await prisma.session.create({
            data: {
                userId: user.id,
                token,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
        });

        return {
            message: 'Registration successful',
            token,
            user: { id: user.id, username: user.username, firstname: user.firstname, email: email }
        };
    } catch (error: any) {
        console.error('Error during registration:', error);
        return reply.code(400).send({ message: error.message || 'Registration failed' });
    }
}

export async function loginHandler(request: FastifyRequest, reply: FastifyReply)
{
    const { email, password } = request.body as {
        email: string;
        password: string;
    }

    try
    {
        //1. get the user
        const user = await getUserByEmail(email);

        if(!user || !await bcrypt.compare(password, user.password))
        {
            return reply.code(401).send({error: 'Invalid credentials'});
        }

        //2. generate JWT
        const token = request.server.jwt.sign(
            {
                userId: user.id,
                email: user.email
            },
            {expiresIn: '24h'}
        );

        //3. save the session
        await prisma.session.create({
            data: {
                userId: user.id,
                token,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24hrs
            },
        });

        return {
        message: 'Login successful',
        token,
        user: { id: user.id, username: user.username, firstname:user.firstname, email: user.email }
        };
    } catch (error) {
    console.error('Error during login:', error);
    return reply.code(500).send({ error: 'Login failed' });
  }
}

export async function logoutHandler(request: FastifyRequest, reply: FastifyReply) {
  try {
    const decoded = await request.jwtVerify() as { userId: number };
    const token = request.headers.authorization?.replace('Bearer ', '');

    if (token) {
      await prisma.session.deleteMany({
        where: { token, userId: decoded.userId }
      });
    }

    return { message: 'Logout successful' };
  } catch (error) {
    return reply.code(401).send({ error: 'Invalid token' });
  }
}

export async function verifyTokenHandler(request: FastifyRequest, reply: FastifyReply) {
  try {
    const decoded = await request.jwtVerify() as { userId: number, email: string };
    const token = request.headers.authorization?.replace('Bearer ', '');

    if (token) {
      const session = await prisma.session.findFirst({
        where: { token, userId: decoded.userId }
      });

      if (!session || session.expiresAt < new Date()) {
        return reply.code(401).send({ error: 'Invalid or expired token' });
      }

      // obtain updated info from user
      const user = await getUserByEmail(decoded.email);
      if (!user) {
        return reply.code(401).send({ error: 'User not found' });
      }

      return {
        valid: true,
        user: { id: user.id, username: user.username, firstname: user.firstname, email: user.email }
      };
    }

    return reply.code(401).send({ error: 'No token provided' });
  } catch (error) {
    return reply.code(401).send({ error: 'Invalid token' });
  }
}