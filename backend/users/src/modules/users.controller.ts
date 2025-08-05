import { FastifyReply, FastifyRequest } from "fastify";
import * as bcrypt from 'bcrypt'
import prisma  from '../utils/prisma'

export async function createUserHandler(request:  FastifyRequest, reply: FastifyReply)
{
  const { username, email, password } = request.body as {
    username: string;
    email: string;
    password: string;
  };
  try{
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, email, password: hashedPassword },
    });
    return {id: user.id, username: user.username};

  }
  catch (error){
    console.log("Error creating the user: ", error);
    reply.code(500).send({error: "Failed to create user. Please try again."});
  }
}

export async function getUsersHandler(request:FastifyRequest, reply: FastifyReply) {
  const users = await prisma.user.findMany({
    select: {id: true, username: true, email: true}, //not necessary to put the pass field bc is not secure
  });
  return users;    
}