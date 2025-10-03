import { FastifyRequest, FastifyReply } from "fastify";
import prisma from "../utils/prisma";

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
      return reply.code(409).send({
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
      return reply.code(404).send({
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
