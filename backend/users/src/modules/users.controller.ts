import { FastifyReply, FastifyRequest } from "fastify";
import * as bcrypt from 'bcrypt'
import prisma  from '../utils/prisma'


function isValidCuid(id: string): boolean {
  return /^c[a-z0-9]{24}$/.test(id);
}

export async function createUserHandler(request: FastifyRequest, reply: FastifyReply) {
  const { username, email, firstname, password, avatarUrl } = request.body as {
    username: string;
    email: string;
    firstname: string;
    password: string;
    avatarUrl?: string;
  };
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { 
        username, 
        email, 
        firstname, 
        password: hashedPassword,
        avatarUrl: avatarUrl || "/assets/img/avatar.jpg"
      },
    });
    return { 
      id: user.id, 
      username: user.username, 
      firstname: user.firstname,
      avatarUrl: user.avatarUrl
    };

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

export async function deleteUserHandler(request: FastifyRequest, reply: FastifyReply) {
  const { id, email } = request.body as { id?: string; email?: string };

  if(!id && !email) {
    reply.code(400).send({error: "User id or email must be provided"});
    return;
  }

  // Validate ID format if provided
  if (id && !isValidCuid(id)) {
    reply.code(400).send({error: "Invalid user ID format"});
    return;
  }

  try {
    const where = id ? {id} : {email};
    const deletedUser = await prisma.user.delete({where});

    reply.send({
      message: "User deleted successfully",
      user: { id: deletedUser.id, username: deletedUser.username, email: deletedUser.email}
    });
  } catch (error: any) {
    if(error.code === "P2025") {
      reply.code(404).send({error: "User not found"});
    } else {
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
    
    return {
      id: user.id,
      username: user.username,
      firstname: user.firstname,
      email: user.email,
      avatarUrl: user.avatarUrl,
      password: user.password
    };
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return reply.code(500).send({ error: 'Failed to fetch user' });
  }
}

export async function getUserByUsernameHandler(request: FastifyRequest, reply: FastifyReply) {
  const { username } = request.params as { username: string };
  
  try {
    const user = await prisma.user.findUnique({
      where: { username }
    });
    
    if (!user) {
      return reply.code(404).send({ error: 'User not found' });
    }
    
    return {
      id: user.id,
      username: user.username,
      firstname: user.firstname,
      email: user.email,
      avatarUrl: user.avatarUrl,
      password: user.password
    };
  } catch (error) {
    console.error('Error fetching user by username:', error);
    return reply.code(500).send({ error: 'Failed to fetch user' });
  }
}

// user stats getters
export const getUserStats = async (
  request: FastifyRequest<{ Params: { id: string } }>, // Changed from number to string
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;
    
    // Validate ID format
    if (!isValidCuid(id)) {
      return reply.status(400).send({ error: 'Invalid user ID format' });
    }
    
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        gamesPlayed: true,
        gamesWon: true,
        totalScore: true
      }
    });
    
    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }
    
    const winRate = user.gamesPlayed > 0 ? (user.gamesWon / user.gamesPlayed) * 100 : 0;
    
    return reply.send({
      ...user,
      winRate: Math.round(winRate * 100) / 100
    });
  } catch (error) {
    return reply.status(500).send({ error: 'Failed to get user stats' });
  }
};

export const updateUserStats = async (
  request: FastifyRequest<{ 
    Params: { id: string }; // Changed from number to string
    Body: { isWinner: boolean; score: number; gameId: string; opponentId?: string } 
  }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;
    const { isWinner, score, gameId, opponentId } = request.body;
    
    // Validate IDs
    if (!isValidCuid(id)) {
      return reply.status(400).send({ error: 'Invalid user ID format' });
    }
    if (!isValidCuid(gameId)) {
      return reply.status(400).send({ error: 'Invalid game ID format' });
    }
    if (opponentId && !isValidCuid(opponentId)) {
      return reply.status(400).send({ error: 'Invalid opponent ID format' });
    }
    
    // update users stats
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        gamesPlayed: { increment: 1 },
        gamesWon: isWinner ? { increment: 1 } : undefined,
        totalScore: { increment: score }
      }
    });
    
    // register the history
    await prisma.userGameHistory.create({
      data: {
        userId: id,
        gameId,
        isWinner,
        score,
        opponentId
      }
    });
    
    return reply.send({ message: 'Stats updated successfully' });
  } catch (error) {
    return reply.status(500).send({ error: 'Failed to update user stats' });
  }
};

export const getUsersByIds = async (
  request: FastifyRequest<{ Body: { userIds: string[] } }>,
  reply: FastifyReply
) => {
  try {
    const { userIds } = request.body;
    
    // Validate all IDs
    const invalidIds = userIds.filter(id => !isValidCuid(id));
    if (invalidIds.length > 0) {
      return reply.status(400).send({ error: 'Invalid user ID format in request' });
    }
    
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds }
      },
      select: {
        id: true,
        username: true,
        email: true
      }
    });
    
    return reply.send(users);
  } catch (error) {
    return reply.status(500).send({ error: 'Failed to get users' });
  }
};

// --- Friend Request Handlers ---

export async function sendFriendRequestHandler(request: FastifyRequest, reply: FastifyReply) {
  const requesterId = (request.user as any).id;
  const { receiverId } = request.body as { receiverId: string };

  if (requesterId === receiverId) {
    return reply.code(400).send({ error: "You cannot send a friend request to yourself." });
  }

  try {
    // Check if a friendship already exists
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId, receiverId },
          { requesterId: receiverId, receiverId: requesterId },
        ],
      },
    });

    if (existingFriendship) {
      return reply.code(409).send({ error: "A friend request already exists or you are already friends." });
    }

    const friendship = await prisma.friendship.create({
      data: {
        requesterId,
        receiverId,
      },
    });

    return reply.code(201).send(friendship);
  } catch (error) {
    console.error("Error sending friend request:", error);
    return reply.code(500).send({ error: "Failed to send friend request." });
  }
}

export async function getFriendRequestsHandler(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any).id;

    try {
        const pendingRequests = await prisma.friendship.findMany({
            where: {
                receiverId: userId,
                status: 'PENDING',
            },
            include: {
                requester: {
                    select: { id: true, username: true, avatarUrl: true },
                },
            },
        });
        return reply.send(pendingRequests);
    } catch (error) {
        console.error("Error fetching friend requests:", error);
        return reply.code(500).send({ error: "Failed to retrieve friend requests." });
    }
}

export async function respondToFriendRequestHandler(request: FastifyRequest, reply: FastifyReply) {
  const userId = (request.user as any).id;
  const { friendshipId } = request.params as { friendshipId: string };
  const { status } = request.body as { status: 'ACCEPTED' | 'REJECTED' };

  if (!['ACCEPTED', 'REJECTED'].includes(status)) {
    return reply.code(400).send({ error: "Invalid status." });
  }

  try {
    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship || friendship.receiverId !== userId) {
      return reply.code(404).send({ error: "Friend request not found or you are not the receiver." });
    }

    if (friendship.status !== 'PENDING') {
        return reply.code(400).send({ error: "This friend request has already been responded to." });
    }

    const updatedFriendship = await prisma.friendship.update({
      where: { id: friendshipId },
      data: { status },
    });

    return reply.send(updatedFriendship);
  } catch (error) {
    console.error("Error responding to friend request:", error);
    return reply.code(500).send({ error: "Failed to respond to friend request." });
  }
}

export async function getFriendsHandler(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any).id;

    try {
        const friendships = await prisma.friendship.findMany({
            where: {
                status: 'ACCEPTED',
                OR: [
                    { requesterId: userId },
                    { receiverId: userId },
                ],
            },
            include: {
                requester: { select: { id: true, username: true, avatarUrl: true } },
                receiver: { select: { id: true, username: true, avatarUrl: true } },
            },
        });

        const friends = friendships.map(f => {
            return f.requesterId === userId ? f.receiver : f.requester;
        });

        return reply.send(friends);
    } catch (error) {
        console.error("Error fetching friends:", error);
        return reply.code(500).send({ error: "Failed to retrieve friends." });
    }
}