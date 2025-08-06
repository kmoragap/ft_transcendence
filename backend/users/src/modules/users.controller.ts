import { FastifyReply, FastifyRequest } from "fastify";
import * as bcrypt from 'bcrypt'
import prisma  from '../utils/prisma'


//TODO: not sure if I need to store the id as string or number
export async function createUserHandler(request: FastifyRequest, reply: FastifyReply) {
  const { username, email, firstname, password } = request.body as {
    username: string;
    email: string;
    firstname: string;
    password: string;
  };
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, email, firstname, password: hashedPassword },
    });
    return { id: user.id, username: user.username, firstname: user.firstname };

  } catch (error: any) {
    console.log("Error creating the user: ", error);
    
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0];
      if (field === 'email') {
        return reply.code(409).send({ error: "Email already exists" });
      } else if (field === 'username') {
        return reply.code(409).send({ error: "Username already exists" });
      }
      return reply.code(409).send({ error: "User already exists" });
    }
    
    return reply.code(500).send({ error: "Failed to create user. Please try again." });
  }
}

export async function deleteUserHandler(request: FastifyRequest, reply: FastifyReply)
{
  //should I accept both email and id?
  const { id, email } = request.body as { id?: number; email?: string };

  if(!id && !email)
  {
    reply.code(400).send({error: "User id or email must be provided"});
    return;
  }

  try
  {
    const where = id ? {id} : {email};
    const deletedUser = await prisma.user.delete({where});

    reply.send({
      message: "User deleted successfully",
      user: { id: deletedUser.id, username: deletedUser.username, email: deletedUser.email}
    });
  }
  catch (error: any) {
    //in case prisma throws bc user doesnt exist
    if(error.code === "P2025")
    {
      reply.code(404).send({error: "User not found"});
    }
    else
    {
      console.error("Error deleting user:", error);
      reply.code(500).send({error: "Failed to delete user. Please try again."});
    }
  }
}

export async function getUsersHandler(request:FastifyRequest, reply: FastifyReply) {
  const users = await prisma.user.findMany({
    select: {id: true, username: true, email: true, firstname: true}, 
  });
  return users;    
}

export async function getUserByEmailHandler(request: FastifyRequest, reply: FastifyReply) {
  const { email } = request.params as { email: string };
  
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return reply.code(404).send({ error: 'User not found' });
    }
    
    return user;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return reply.code(500).send({ error: 'Failed to fetch user' });
  }
}