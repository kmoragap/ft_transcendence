import { FastifyReply, FastifyRequest } from "fastify";
import * as bcrypt from "bcrypt";
import prisma from "../utils/prisma";
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

function isValidCuid(id: string): boolean {
  return /^c[a-z0-9]{24}$/.test(id);
}

export async function createUserHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
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
        avatarUrl: avatarUrl || "/assets/img/avatar.jpg",
      },
    });
    return {
      id: user.id,
      username: user.username,
      firstname: user.firstname,
      avatarUrl: user.avatarUrl,
    };
  } catch (error: any) {
    console.log("Error creating the user: ", error);

    if (error.code === "P2002") {
      const field = error.meta?.target?.[0];
      if (field === "email") {
        return reply.code(409).send({ error: "Email already exists" });
      } else if (field === "username") {
        return reply.code(409).send({ error: "Username already exists" });
      }
      return reply.code(409).send({ error: "User already exists" });
    }

    return reply
      .code(500)
      .send({ error: "Failed to create user. Please try again." });
  }
}

export async function deleteUserHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id, email } = request.body as { id?: string; email?: string };

  if (!id && !email) {
    reply.code(400).send({ error: "User id or email must be provided" });
    return;
  }

  // Validate ID format if provided
  if (id && !isValidCuid(id)) {
    reply.code(400).send({ error: "Invalid user ID format" });
    return;
  }

  try {
    const where = id ? { id } : { email };
    const deletedUser = await prisma.user.delete({ where });

    reply.send({
      message: "User deleted successfully",
      user: {
        id: deletedUser.id,
        username: deletedUser.username,
        email: deletedUser.email,
      },
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      reply.code(404).send({ error: "User not found" });
    } else {
      console.error("Error deleting user:", error);
      reply
        .code(500)
        .send({ error: "Failed to delete user. Please try again." });
    }
  }
}

export async function getUsersHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      firstname: true,
      avatarUrl: true,
      gamesPlayed: true,
      gamesWon: true,
      totalScore: true,
    },
  });
  return users;
}

export async function searchUsersHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { q } = request.query as { q: string };

  if (!q || q.length < 2) {
    return reply.send([]);
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [{ username: { contains: q } }, { firstname: { contains: q } }],
      },
      select: {
        id: true,
        username: true,
        firstname: true,
        avatarUrl: true,
        gamesPlayed: true,
        gamesWon: true,
        totalScore: true,
      },
    });

    return reply.send(users);
  } catch (error) {
    console.error("Error searching users:", error);
    return reply.code(500).send({ error: "Failed to search users" });
  }
}

export async function getUserByEmailHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { email } = request.params as { email: string };

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return reply.code(404).send({ error: "User not found" });
    }

    return {
      id: user.id,
      username: user.username,
      firstname: user.firstname,
      email: user.email,
      avatarUrl: user.avatarUrl,
      password: user.password,
    };
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return reply.code(500).send({ error: "Failed to fetch user" });
  }
}

export async function getUserByUsernameHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { username } = request.params as { username: string };

  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return reply.code(404).send({ error: "User not found" });
    }
    return {
      id: user.id,
      username: user.username,
      firstname: user.firstname,
      email: user.email,
      avatarUrl: user.avatarUrl,
      password: user.password,
    };
  } catch (error) {
    console.error("Error fetching user by username:", error);
    return reply.code(500).send({ error: "Failed to fetch user" });
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
      return reply.status(400).send({ error: "Invalid user ID format" });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        gamesPlayed: true,
        gamesWon: true,
        totalScore: true,
      },
    });

    if (!user) {
      return reply.status(404).send({ error: "User not found" });
    }

    const winRate =
      user.gamesPlayed > 0 ? (user.gamesWon / user.gamesPlayed) * 100 : 0;

    return reply.send({
      ...user,
      winRate: Math.round(winRate * 100) / 100,
    });
  } catch (error) {
    return reply.status(500).send({ error: "Failed to get user stats" });
  }
};

export const updateUserStats = async (
  request: FastifyRequest<{
    Params: { id: string }; // Changed from number to string
    Body: {
      isWinner: boolean;
      score: number;
      gameId: string;
      opponentId?: string;
    };
  }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;
    const { isWinner, score, gameId, opponentId } = request.body;

    // Validate IDs
    if (!isValidCuid(id)) {
      return reply.status(400).send({ error: "Invalid user ID format" });
    }
    if (!isValidCuid(gameId)) {
      return reply.status(400).send({ error: "Invalid game ID format" });
    }
    if (opponentId && !isValidCuid(opponentId)) {
      return reply.status(400).send({ error: "Invalid opponent ID format" });
    }

    // update users stats
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        gamesPlayed: { increment: 1 },
        gamesWon: isWinner ? { increment: 1 } : undefined,
        totalScore: { increment: score },
      },
    });

    // register the history
    await prisma.userGameHistory.create({
      data: {
        userId: id,
        gameId,
        isWinner,
        score,
        opponentId,
      },
    });

    return reply.send({ message: "Stats updated successfully" });
  } catch (error) {
    return reply.status(500).send({ error: "Failed to update user stats" });
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
      return reply
        .status(400)
        .send({ error: "Invalid user ID format in request" });
    }

    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
      },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });

    return reply.send(users);
  } catch (error) {
    return reply.status(500).send({ error: "Failed to get users" });
  }
};

// --- Friend Request Handlers ---

export async function sendFriendRequestHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  if (!request.user) {
    return reply
      .code(401)
      .send({ error: "Unauthorized: No user token provided." });
  }
  const requesterId = request.user.id;
  const { username: receiverUsername } = request.body as { username: string };

  if (!receiverUsername) {
    return reply.code(400).send({ error: "Username must be provided." });
  }

  if (request.user.username === receiverUsername) {
    return reply
      .code(400)
      .send({ error: "You cannot send a friend request to yourself." });
  }

  try {
    // Find the receiver user by username
    const receiver = await prisma.user.findUnique({
      where: { username: receiverUsername },
    });

    if (!receiver) {
      return reply.code(404).send({ error: "User not found." });
    }
    const receiverId = receiver.id;

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
      return reply
        .code(409)
        .send({
          error: "A friend request already exists or you are already friends.",
        });
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

export async function getFriendRequestsHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  if (!request.user) {
    return reply
      .code(401)
      .send({ error: "Unauthorized: No user token provided." });
  }
  const userId = request.user.id;

  try {
    const pendingRequests = await prisma.friendship.findMany({
      where: {
        receiverId: userId,
        status: "PENDING",
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
    return reply
      .code(500)
      .send({ error: "Failed to retrieve friend requests." });
  }
}

export async function respondToFriendRequestHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  if (!request.user) {
    return reply
      .code(401)
      .send({ error: "Unauthorized: No user token provided." });
  }
  const userId = request.user.id;
  const { friendshipId } = request.params as { friendshipId: string };
  const { status } = request.body as { status: "ACCEPTED" | "REJECTED" };

  if (!["ACCEPTED", "REJECTED"].includes(status)) {
    return reply.code(400).send({ error: "Invalid status." });
  }

  try {
    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship || friendship.receiverId !== userId) {
      return reply
        .code(404)
        .send({
          error: "Friend request not found or you are not the receiver.",
        });
    }

    if (friendship.status !== "PENDING") {
      return reply
        .code(400)
        .send({ error: "This friend request has already been responded to." });
    }

    const updatedFriendship = await prisma.friendship.update({
      where: { id: friendshipId },
      data: { status },
    });

    return reply.send(updatedFriendship);
  } catch (error) {
    console.error("Error responding to friend request:", error);
    return reply
      .code(500)
      .send({ error: "Failed to respond to friend request." });
  }
}

export async function getFriendsHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  if (!request.user) {
    return reply
      .code(401)
      .send({ error: "Unauthorized: No user token provided." });
  }
  const userId = request.user.id;

  try {
    const friendships = await prisma.friendship.findMany({
      where: {
        status: "ACCEPTED",
        OR: [{ requesterId: userId }, { receiverId: userId }],
      },
      include: {
        requester: {
          select: { id: true, username: true, avatarUrl: true, isOnline: true },
        },
        receiver: {
          select: { id: true, username: true, avatarUrl: true, isOnline: true },
        },
      },
    });

    const friends = friendships.map(f => {
      const friend = f.requesterId === userId ? f.receiver : f.requester;
      return {
        id: f.id, // Include friendship ID for deletion
        username: friend.username,
        avatarUrl: friend.avatarUrl,
        isOnline: friend.isOnline,
      };
    });

    return reply.send(friends);
  } catch (error) {
    console.error("Error fetching friends:", error);
    return reply.code(500).send({ error: "Failed to retrieve friends." });
  }
}

export async function getAllFriendshipsHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  if (!request.user) {
    return reply
      .code(401)
      .send({ error: "Unauthorized: No user token provided." });
  }
  const userId = request.user.id;

  try {
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [{ requesterId: userId }, { receiverId: userId }],
      },
      include: {
        requester: {
          select: { id: true, username: true, avatarUrl: true, isOnline: true },
        },
        receiver: {
          select: { id: true, username: true, avatarUrl: true, isOnline: true },
        },
      },
    });

    const allFriendships = friendships.map(f => {
      const otherUser = f.requesterId === userId ? f.receiver : f.requester;
      return {
        id: f.id,
        status: f.status,
        otherUser: {
          username: otherUser.username,
          avatarUrl: otherUser.avatarUrl,
          isOnline: otherUser.isOnline,
        },
        isRequester: f.requesterId === userId,
      };
    });

    return reply.send(allFriendships);
  } catch (error) {
    console.error("Error fetching all friendships:", error);
    return reply.code(500).send({ error: "Failed to retrieve friendships." });
  }
}

export async function deleteFriendHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  if (!request.user) {
    return reply
      .code(401)
      .send({ error: "Unauthorized: No user token provided." });
  }

  const { friendshipId } = request.params as { friendshipId: string };
  const userId = request.user.id;

  try {
    // First, verify that the friendship exists and the user is part of it
    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
      include: {
        requester: { select: { id: true, username: true } },
        receiver: { select: { id: true, username: true } },
      },
    });

    if (!friendship) {
      return reply.code(404).send({ error: "Friendship not found." });
    }

    // Check if the current user is either the requester or receiver
    if (friendship.requesterId !== userId && friendship.receiverId !== userId) {
      return reply
        .code(403)
        .send({ error: "You are not authorized to delete this friendship." });
    }

    // Delete the friendship
    await prisma.friendship.delete({
      where: { id: friendshipId },
    });
    return reply.send({ message: "Friend removed successfully." });
  } catch (error) {
    console.error("Error deleting friend:", error);
    return reply.code(500).send({ error: "Failed to delete friend." });
  }
}

export async function updateMyProfileHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { username, firstname, email } = request.body as {
    username?: string;
    firstname?: string;
    email?: string;
  };

  const userId = request.user?.id;
  if (!userId) return reply.code(401).send({ error: "Unauthorized" });

  try {
    // Check if username or email already exists (if they're being changed)
    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          NOT: { id: userId },
        },
      });
      if (existingUser) {
        return reply.code(409).send({ error: "Username already exists" });
      }
    }

    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id: userId },
        },
      });
      if (existingUser) {
        return reply.code(409).send({ error: "Email already exists" });
      }
    }

    // Update user profile
    const updateData: any = {};
    if (username) updateData.username = username;
    if (firstname) updateData.firstname = firstname;
    if (email) updateData.email = email;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        firstname: true,
        email: true,
        avatarUrl: true,
      },
    });

    return reply.send({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return reply.code(500).send({ error: "Failed to update profile" });
  }
}

export async function uploadAvatarHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  // file comes from @fastify/multipart (make sure it's registered before routes)
  const file = await request.file({ limits: { fileSize: 2 * 1024 * 1024 } }); // 2MB
  if (!file) return reply.code(400).send({ error: "No file uploaded" });

  const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
  const ct = (file.mimetype || "").toLowerCase();
  if (!allowed.has(ct))
    return reply.code(415).send({ error: "Unsupported file type" });

  // auth: get current user id from token/middleware
  const userId = request.user?.id;
  if (!userId) return reply.code(401).send({ error: "Unauthorized" });

  // read the upload stream to buffer
  const chunks: Buffer[] = [];
  for await (const chunk of file.file) chunks.push(chunk as Buffer);
  const input = Buffer.concat(chunks);

  const avatarsDir = path.resolve(process.cwd(), "uploads", "avatars");
  await fs.mkdir(avatarsDir, { recursive: true });

  const filename = `${randomUUID()}.webp`;
  const outPath = path.join(avatarsDir, filename);

  await sharp(input, { failOn: "none" })
    .rotate()
    .resize(256, 256, { fit: "cover" })
    .webp({ quality: 85 })
    .toFile(outPath);

  const where = { id: userId };

  const current = await prisma.user.findUnique({
    where,
    select: { avatarUrl: true },
  });
  if (current?.avatarUrl?.startsWith("/uploads/avatars/")) {
    const oldPath = path.resolve(
      process.cwd(),
      current.avatarUrl.replace("/uploads/", "uploads/")
    );
    fs.unlink(oldPath).catch(() => {});
  }

  const publicUrl = `/uploads/avatars/${filename}`;

  await prisma.user.update({
    where,
    data: { avatarUrl: publicUrl },
  });

  return reply.send({ avatarUrl: publicUrl });
}

export async function updateOnlineStatusHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = request.user?.id;
  if (!userId) return reply.code(401).send({ error: "Unauthorized" });

  const { isOnline } = request.body as { isOnline: boolean };

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isOnline },
    });

    return reply.send({
      message: "Online status updated successfully",
      isOnline,
    });
  } catch (error: any) {
    console.error("Error updating online status:", error);
    return reply.code(500).send({ error: "Failed to update online status" });
  }
}

export async function updateOnlineStatusByIdHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { userId } = request.params as { userId: string };
  const { isOnline } = request.body as { isOnline: boolean };

  if (!isValidCuid(userId)) {
    return reply.code(400).send({ error: "Invalid user ID format" });
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isOnline },
    });

    return reply.send({
      message: "Online status updated successfully",
      isOnline,
    });
  } catch (error: any) {
    console.error("Error updating online status:", error);
    return reply.code(500).send({ error: "Failed to update online status" });
  }
}
