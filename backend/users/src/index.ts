import fastify from "fastify";
import * as bcrypt from "bcrypt"
import { PrismaClient } from "@prisma/client";

//typed client based on my schema
const prisma = new PrismaClient();

const server = fastify({ logger: true });

server.get("/", async (request, reply) => {
  return { message: "Users service is up!" } as const;
});


// FOR THE USER STUFF
server.post("/users", async (request, reply) => {
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
});

server.get('/users', async(request, reply) => {
  const users = await prisma.user.findMany({
    select: {id: true, username: true, email: true}, //not necessary to put the pass field bc is not secure
  });
  return users;
});

const start = async () => {
  try {
    await server.listen({ port: 3000, host: "0.0.0.0" });
    console.log("Users service running on port 3000");
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});